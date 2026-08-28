# Behavior Smoke Checks

Use this page as the short behavior-smoke entry point. The detailed frontend
browser checklist lives in `docs/frontend-smoke-checklist.md`.

## Automated Checks

Run these from the project root:

```sh
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
DISABLE_SPRING=1 bin/rails test
npm run test:frontend
npm run build
```

Expected results:

- Full Rails and frontend suites pass.
- Webpack compiles successfully.

The automated tests cover:

- auth/session behavior
- signup and current-account email behavior
- user recommendations and user show payloads
- follow/unfollow feed behavior
- posts feed and CRUD behavior
- tag normalization, atomic post writes, serialization, and accessible-feed
  filtering with pagination
- Active Storage-backed post uploads
- like/unlike behavior
- profile/settings behavior
- email-verification delivery and token lifecycle
- password-reset delivery, rate limiting, expiration, replacement, and
  single-use behavior
- recovery-page validation, accessibility, and focus behavior
- profile identity, pagination, tag filtering, relationship views, cache
  invalidation, navigation entry points, and accessible state handling

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
- tagged posts, including more than one accessible page under `performance`
- reciprocal PicMeS Guest relationships with 1,001 deterministic profile users
  for compact counts and multi-page Followers/Following checks

## Manual Dashboard Checks

Run the detailed browser checklist in `docs/frontend-smoke-checklist.md` after
starting the Rails app locally.

Authentication:

- Log in as the guest user.
  - Expected: dashboard renders.
- Refresh while logged in.
  - Expected: dashboard still renders.
- Log out.
  - Expected: auth page is available again.

Settings and recovery:

- Add or replace a personal-account email and complete verification.
  - Expected: Settings reports the verified address.
- Request a password-reset message from the logged-out authentication page.
  - Expected: the uniform success state appears without revealing whether the
    address belongs to an account.
- Complete a reset with the newest valid link.
  - Expected: the password changes, existing sessions are invalidated, and the
    link cannot be reused.

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

Tag behavior:

- Create and edit posts with tags across all six post types.
  - Expected: tags normalize, render alphabetically, and persist atomically with
    the post.
- Select the seeded `performance` tag and scroll near the end of the rendered
  posts.
  - Expected: only matching accessible posts render and the next filtered page
    loads automatically.
- Reload the filtered URL, use Back and Forward, then activate `× Clear`.
  - Expected: URL state, results, focus, and full-feed restoration stay in sync.
- Scroll down the dashboard, open a profile, and return with browser Back.
  - Expected: cached feed pages remain rendered and the existing dashboard
    history entry restores its previous responsive scroll-container position.
- Activate Back to dashboard from a profile.
  - Expected: the new dashboard history entry opens at the top of the full
    feed.
- Complete tag entry, removal, selection, and clearing with only the keyboard at
  narrow and wide viewport sizes.
  - Expected: focus indicators remain visible and content does not overflow.

Profile behavior:

- Open PicMeS Guest from the account menu and post-form avatar, then open other
  profiles from feed authors, recommendations, and relationship cards.
  - Expected: every entry point opens the canonical selected-user profile.
- Switch among Posts, Followers, and Following; reload; and use Back and
  Forward.
  - Expected: URL-owned view state and profile identity remain synchronized.
- Scroll near the end of each profile collection and exercise profile-scoped
  tag filtering.
  - Expected: subsequent pages load automatically, results append without
    duplicates, and filters remain scoped to the selected profile.
- After loading a subsequent profile page, change views and use browser Back
  and Forward.
  - Expected: cached pages and the previous scroll position are restored for
    each history entry.
- Follow and unfollow from profile headers and relationship cards.
  - Expected: profile counts, relationship lists, feed posts, and
  recommendations refresh after successful mutations.
- Check PicMeS Guest at narrow and wide viewport sizes using only the keyboard.
  - Expected: compact counts expose exact accessible values, all controls have
  visible focus, and profile content does not overflow.

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
- Broader automated API coverage was added in Phase 7.
- Frontend browser smoke checks stay manual until the app has enough repeated
  smoke-test burden to justify heavier browser automation.
