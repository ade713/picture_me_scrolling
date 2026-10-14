import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ApiError, destroy, get, patch, post } from "../util/api_client";
import { useCreateComment, useDeleteComment, usePostComments, useUpdateComment } from "./comment_hooks";
import { queryKeys } from "./query_keys";

vi.mock("../util/api_client", async (importOriginal) => ({
  ...(await importOriginal()),
  destroy: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

const page = (comments, cursor = null) => ({
  comments: Object.fromEntries(comments.map((comment) => [comment.id, comment])),
  comment_ids: comments.map((comment) => comment.id),
  pagination: { per_page: 10, has_more: Boolean(cursor), next_cursor: cursor },
});

describe("comment hooks", () => {
  let client;
  let wrapper;

  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  });

  afterEach(() => {
    client.clear();
    vi.resetAllMocks();
  });

  it("loads ordered comments using an encoded cursor and stops at the final page", async () => {
    get.mockResolvedValueOnce(page([{ id: 1 }], "cursor+/=")).mockResolvedValueOnce(page([{ id: 2 }]));
    const { result } = renderHook(() => usePostComments(10), { wrapper });

    await waitFor(() => expect(result.current.data?.comments).toEqual([{ id: 1 }]));
    expect(get).toHaveBeenNthCalledWith(1, "/api/posts/10/comments?per_page=10", { signal: expect.any(AbortSignal) });
    await act(async () => {
      await result.current.fetchNextPage();
    });
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.data.comments).toEqual([{ id: 1 }, { id: 2 }]));
    expect(get).toHaveBeenNthCalledWith(2, "/api/posts/10/comments?per_page=10&after=cursor%2B%2F%3D", {
      signal: expect.any(AbortSignal),
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it("disables missing IDs and isolates each posts cache while normalizing ID types", async () => {
    get.mockImplementation((url) => Promise.resolve(page([{ id: url.includes("/10/") ? 1 : 2 }])));
    const { result, rerender } = renderHook(({ id }) => usePostComments(id), {
      initialProps: { id: undefined },
      wrapper,
    });
    expect(get).not.toHaveBeenCalled();
    rerender({ id: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ id: "20" });
    await waitFor(() => expect(result.current.data.comments).toEqual([{ id: 2 }]));
    expect(client.getQueryData(queryKeys.postComments("10")).pages[0].comment_ids).toEqual([1]);
  });

  it("preserves loaded comments when fetching another page fails", async () => {
    const error = new ApiError("Unavailable", { status: 500 });
    get.mockResolvedValueOnce(page([{ id: 1 }], "next")).mockRejectedValueOnce(error);
    const { result } = renderHook(() => usePostComments(10), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(result.current.data.comments).toEqual([{ id: 1 }]);
  });

  it("returns an empty comments list and preserves initial request errors", async () => {
    get.mockResolvedValueOnce(page([]));
    const { result, rerender } = renderHook(({ id }) => usePostComments(id), {
      initialProps: { id: 10 },
      wrapper,
    });
    await waitFor(() => expect(result.current.data?.comments).toEqual([]));
    expect(result.current.hasNextPage).toBe(false);

    const error = new ApiError("Post not found", { status: 404 });
    get.mockRejectedValueOnce(error);
    rerender({ id: 20 });
    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.data).toBeUndefined();
  });

  it.each([
    ["create", useCreateComment, post, "New body", "/api/posts/10/comments", { comment: { body: "New body" } }],
    ["update", useUpdateComment, patch, { id: 3, body: "Edited" }, "/api/comments/3", { comment: { body: "Edited" } }],
    ["delete", useDeleteComment, destroy, 3, "/api/comments/3", undefined],
  ])(
    "%s sends the expected request and invalidates only affected consumers",
    async (_name, hook, request, variables, url, body) => {
      const loaded = { pages: [page([{ id: 1 }], "next")], pageParams: [null] };
      client.setQueryData(queryKeys.postComments(10), loaded);
      client.setQueryData(queryKeys.postComments(20), loaded);
      client.setQueryData(queryKeys.post(10), { id: 10 });
      client.setQueryData(queryKeys.post(20), { id: 20 });
      client.setQueryData(queryKeys.posts, { pages: [{ posts: { 10: { id: 10 } } }] });
      client.setQueryData(queryKeys.userPosts(20), { pages: [{ posts: { 20: { id: 20 } } }] });
      const response = body ? { id: 3, body: body.comment.body } : null;
      request.mockResolvedValue(response);
      const { result } = renderHook(() => hook(10), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(variables);
      });
      if (body) expect(request).toHaveBeenCalledWith(url, body);
      else expect(request).toHaveBeenCalledWith(url);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(response);
      expect(client.getQueryData(queryKeys.postComments(10))).toEqual(loaded);
      [queryKeys.postComments(10), queryKeys.post(10), queryKeys.posts].forEach((key) => {
        expect(client.getQueryState(key).isInvalidated).toBe(true);
      });
      [queryKeys.postComments(20), queryKeys.post(20), queryKeys.userPosts(20)].forEach((key) => {
        expect(client.getQueryState(key).isInvalidated).toBe(false);
      });
    },
  );

  it("preserves errors and cached data when a mutation fails", async () => {
    const error = new ApiError("Body cannot be blank", { status: 422 });
    post.mockRejectedValue(error);
    const loaded = { pages: [page([{ id: 1 }])], pageParams: [null] };
    client.setQueryData(queryKeys.postComments(10), loaded);
    const { result } = renderHook(() => useCreateComment(10), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync("")).rejects.toBe(error);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(client.getQueryData(queryKeys.postComments(10))).toEqual(loaded);
    expect(client.getQueryState(queryKeys.postComments(10)).isInvalidated).toBe(false);
  });
});
