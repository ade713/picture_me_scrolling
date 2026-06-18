# Phase 9 Feed Loading Strategy

Phase 9-5 replaces all-at-once dashboard feed loading with an explicit
paginated feed contract and a frontend "Load more posts" control.

## Backend Contract

`GET /api/posts` accepts:

- `page`: one-based page number. Defaults to `1`.
- `per_page`: page size. Defaults to `20` and is capped at `50`.

The response shape is:

```json
{
  "posts": {
    "123": {
      "id": 123,
      "title": "Example post"
    }
  },
  "post_ids": [123],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 134,
    "total_pages": 7,
    "has_more": true
  }
}
```

The `posts` object keeps the existing id-keyed post payload shape.
`post_ids` preserves the ordered display list for the page because JavaScript
does not preserve insertion order for integer-like object keys. The pagination
wrapper is new.

Follow and unfollow responses use the same feed response shape so the frontend
can reset the feed cache consistently after relationship changes.

## Frontend Behavior

- `usePosts` now uses TanStack Query's infinite-query flow.
- The dashboard initially requests the first page.
- The feed renders already loaded pages as one list.
- If another page exists, the feed shows `Load more posts`.
- Clicking the button requests the next page.

This keeps behavior explicit and reviewable before considering infinite scroll
or virtualization.

## Deferred Work

- SQL-level feed query optimization remains future backend performance work.
- Infinite scroll remains optional future UX work.
- Viewport-aware media priority remains tied to later feed/render tuning.
