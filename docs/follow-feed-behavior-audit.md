# Follow/Feed Behavior Audit

Phase 4-1 audit for the dashboard behavior where following or unfollowing a
user can leave the feed stale until a second action or refresh.

## Expected Behavior

- Following a user from the recommended users list should remove that user from
  recommendations and show that user's posts in the dashboard feed without a
  full page refresh.
- Following a post author from the feed should update follow buttons for that
  author and keep the feed consistent with the current follow graph.
- Unfollowing a post author should update follow buttons and remove posts that
  no longer belong in the current user's feed without requiring another action.

## Current Frontend Flow

- `RecommendedUsers` calls `useFollowUser`.
- `FeedItem` calls `useFollowUser` and `useUnfollowUser`.
- `useFollowUser` and `useUnfollowUser` call the follow API and then:
  - replace the `queryKeys.posts` cache with the API response
  - invalidate `queryKeys.users`
- `usePosts` reads from the `queryKeys.posts` cache and renders the dashboard
  feed.
- `useUsers` reads from the `queryKeys.users` cache and renders recommended
  users.

The query keys are consistent, so the frontend can update the feed immediately
if the follow API returns the correct post collection.

## Current Backend Flow

Phase 4-2 fixed the backend flow so the follow endpoint renders the feed after
the relationship changes. Before that fix, `Api::FollowsController#create`
built `@posts` before saving the new follow:

```ruby
@posts = current_user.posts + current_user.followed_posts
@follow.save!
render 'api/posts/index'
```

Before that fix, `Api::FollowsController#destroy` built `@posts` before
destroying the follow:

```ruby
@posts = current_user.posts + current_user.followed_posts
@follow.destroy
render 'api/posts/index'
```

Because the rendered response was based on `@posts`, the API could return the
pre-mutation feed instead of the post-mutation feed. That matched the observed
behavior where the UI did not always look correct until a second action or
refresh caused the posts query to load current data.

## Seed/Test Data Notes

Phase 4-3 added explicit follow relationships to the development seed file.
Before that, seeds created users and posts without a predictable follow graph.
That made it harder to verify feed behavior from a clean local setup because
every user started with only their own posts and a broad set of recommended
users.

The Phase 4-3 seed-data chunk added predictable follow scenarios, including:

- a guest user
- at least one user the guest already follows
- at least one recommended user with posts
- at least one recommended user without posts

That setup makes it easier to verify that follow and unfollow change the feed in
the expected direction.

The Phase 4 smoke checklist lives in `docs/behavior-smoke-checks.md`.

## Phase 4-2 Fix Applied

- Moved the follow API feed collection until after the follow has been saved or
  destroyed.
- Handled failed follow/unfollow mutations with an appropriate JSON error instead
  of relying on bang methods or nil destroys.
- Kept the frontend query keys unchanged because the backend response shape did
  not change.
- Added focused follow controller tests to verify that the existing
  `setQueryData(queryKeys.posts, posts)` path receives the post-mutation feed.

## Recommended Smoke Checks

1. Log in as the guest user.
2. Confirm the dashboard feed shows the current user's posts plus posts from
   already-followed users.
3. Follow a recommended user who has posts.
4. Confirm that user's posts appear without refreshing.
5. Confirm the followed user is removed from recommendations.
6. Unfollow that user from a feed item.
7. Confirm that user's posts are removed without refreshing.
8. Confirm the unfollowed user can appear in recommendations again.
