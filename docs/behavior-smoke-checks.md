# Behavior Smoke Checks

Phase 4 smoke checklist for verifying behavior that was most likely to regress
during the frontend modernization and follow/feed hardening work.

## Automated Checks

Run these from the project root:

```sh
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
DISABLE_SPRING=1 bin/rails test test/controllers/api/follows_controller_test.rb
npm run build
```

Expected results:

- Follow controller tests pass.
- Webpack compiles successfully.

The focused follow controller tests cover:

- following a user returns a feed that includes that user's posts
- unfollowing a user returns a feed that removes that user's posts

## Local Seed Setup

To verify the full dashboard flow manually, start from fresh development seed
data:

```sh
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
DISABLE_SPRING=1 bin/rails db:reset
```

The seed data intentionally includes:

- guest user: `PicMeS Guest`
- guest password: `1Welcome2To3PicMeS`
- a guest-owned post
- guest follows for `eps4thru6` and `Direwolf Family`
- recommended users with posts, such as `DarkHadouMaster`
- recommended users without posts, such as `Ryu`

## Manual Dashboard Checks

Run these after starting the Rails app locally and visiting the React app in the
browser.

Authentication:

- Log in as the guest user.
  - Expected: dashboard renders.
- Refresh while logged in.
  - Expected: dashboard still renders.
- Log out.
  - Expected: auth page is available again.

Initial feed:

- Confirm the guest-owned `Welcome to PicMeS` post is visible.
- Confirm posts from already-followed users are visible.
- Confirm recommended users are visible in the right column.

Follow behavior:

- Follow a recommended user who has posts, such as `DarkHadouMaster`.
  - Expected: that user's posts appear in the feed without refreshing.
  - Expected: that user is removed from recommendations.
- Follow a recommended user without posts, such as `Ryu`, if visible.
  - Expected: recommendations update without adding unrelated feed posts.

Unfollow behavior:

- Unfollow a followed post author from a feed item.
  - Expected: that user's posts are removed from the feed without refreshing.
  - Expected: the user can appear in recommendations again after the users query
    refreshes.

Post behavior:

- Create a text post.
  - Expected: the new post appears in the feed without refreshing.
- Create a media post if local media upload is configured.
  - Expected: the new post appears and the uploaded media renders.
- Delete one of the current user's posts.
  - Expected: the deleted post disappears from the feed without refreshing.

Like behavior:

- Like a post.
  - Expected: the like count and liked state update without refreshing.
- Unlike the same post.
  - Expected: the like count and liked state update without refreshing.

Media rendering:

- Confirm avatar images render for feed authors.
- Confirm image, video, audio, quote, link, and text post bodies still render
  according to post type.

## Notes

- The follow/feed API fix lives in Phase 4-2.
- The repeatable seed scenarios live in Phase 4-3.
- Broader automated coverage belongs in Phase 7, but the follow/feed regression
  test is kept here because it directly protects the Phase 4 behavior fix.
