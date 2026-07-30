# Frontend Smoke Checklist

Use this checklist after frontend-facing changes or before closing a phase that
touches API behavior consumed by React. It is intentionally lightweight: the app
does not need a full browser automation stack yet.

## Preconditions

Start from a clean local database when verifying the complete dashboard flow:

```sh
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
DISABLE_SPRING=1 bin/rails db:reset
```

Build the frontend bundle:

```sh
source "$HOME/.nvm/nvm.sh"
nvm use
npm run build
```

Start the Rails app locally:

```sh
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
DISABLE_SPRING=1 bin/rails server
```

Open the app in a browser at `http://localhost:3000`.

## Seed Account

Use the seeded guest account:

- username: `PicMeS Guest`
- password: `1Welcome2To3PicMeS`

## Auth Smoke

- Visit the root URL while logged out.
  - Expected: auth page renders.
- Create a personal account with a unique username, email, and valid password.
  - Expected: the normalized email is retained and the dashboard renders
    without a page refresh.
- Log in as the guest user.
  - Expected: dashboard renders without a page refresh.
- Refresh the dashboard while logged in.
  - Expected: dashboard still renders and current user is preserved.
- Log out.
  - Expected: auth page renders again.

## Account Settings Smoke

- Open Settings with a personal account that does not yet have an email.
  - Expected: the Email field is empty and marked as not verified.
- Add or change the email using mixed case and surrounding spaces.
  - Expected: the normalized address appears after success, remains unverified,
    and the current session is retained.
- Select Resend verification email for an unverified personal account.
  - Expected: the button is disabled while pending and an accessible success
    message appears after delivery.
- Exercise a local delivery failure or temporarily stop the configured mail
  service before resending.
  - Expected: an accessible error appears and the resend action becomes
    available for another attempt.
- Submit an invalid or already-used email.
  - Expected: an accessible validation message appears and the stored email is
    unchanged.
- Open Settings as `PicMeS Guest`.
  - Expected: email, avatar, and password controls are disabled.

## Email Verification Smoke

- Open the verification link from the generated message in `tmp/mail`.
  - Expected: the public confirmation page announces a pending state, verifies
    automatically, then focuses and announces the success result.
- Follow a valid verification link while logged into the matching account.
  - Expected: Continue to settings is available and Settings shows the email as
    verified without requiring a full page refresh.
- Follow a valid verification link while logged out.
  - Expected: verification succeeds and Continue to login is available.
- Reopen a used, expired, superseded, or malformed verification link.
  - Expected: the page focuses an accessible error result and explains that a
    new verification email can be requested from Settings.
- Complete the flow using only the keyboard.
  - Expected: the PicMeS link, resend action, and result navigation link have
    visible focus indicators and follow document order.

## Dashboard Feed Smoke

- Confirm the guest-owned `Welcome to PicMeS` post is visible.
- Confirm posts from already-followed users are visible.
- Confirm recommended users render in the right column.
- Confirm image/video/audio/text/quote/link post bodies render according to
  post type.
- Confirm author avatars render when present.

## Follow Smoke

- Follow a recommended user with posts, such as `DarkHadouMaster` if visible.
  - Expected: that user's posts appear in the feed without a manual refresh.
  - Expected: that user is removed from recommendations.
- Follow a recommended user without posts, such as `Ryu` if visible.
  - Expected: recommendations update without adding unrelated feed posts.
- Unfollow a followed post author from a feed item.
  - Expected: that author's posts are removed from the feed without a manual
    refresh.

## Like Smoke

- Like a post.
  - Expected: liked state and like count update without a manual refresh.
- Unlike the same post.
  - Expected: liked state and like count update without a manual refresh.

## Post Smoke

- Create a text post.
  - Expected: the new post appears in the feed without a manual refresh.
- Create a photo/media post with a local file.
  - Expected: the new post appears in the feed and media renders.
- Delete one of the current user's posts.
  - Expected: the deleted post disappears from the feed without a manual
    refresh.

## API Coverage Backstop

Run the focused backend coverage when checking behavior without a browser:

```sh
export PATH="$HOME/.asdf/bin:$HOME/.asdf/shims:$PATH"
DISABLE_SPRING=1 bin/rails test \
  test/controllers/api/session_controller_test.rb \
  test/controllers/api/users_controller_test.rb \
  test/controllers/api/accounts_controller_test.rb \
  test/controllers/api/email_verifications_controller_test.rb \
  test/controllers/api/follows_controller_test.rb \
  test/controllers/api/posts_controller_test.rb \
  test/controllers/api/likes_controller_test.rb
```

This does not replace the browser smoke pass, but it covers the API contracts
that the dashboard and TanStack Query hooks rely on.

## Notes

- Keep this checklist manual until repeated failures justify heavier frontend
  automation.
- Prefer adding focused Rails API tests for backend contract bugs.
- Prefer adding a browser automation tool only when there are stable selectors,
  predictable seed data, and enough repeated manual effort to justify the
  maintenance cost.
