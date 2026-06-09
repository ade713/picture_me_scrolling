# Test Coverage Inventory

Phase 7 starts by documenting current test coverage before adding more tests.
The goal is to protect modernization work with focused behavior coverage, not to
create broad test infrastructure before the app needs it.

## Current Automated Coverage

Rails controller tests exist for the API namespace:

- `test/controllers/api/follows_controller_test.rb`
  - covers follow create returning a feed with the followed user's posts
  - covers follow destroy returning a feed without the unfollowed user's posts
- `test/controllers/api/likes_controller_test.rb`
  - covers like create and destroy
  - covers duplicate like validation
  - covers missing post and missing like responses
  - covers login requirement
- `test/controllers/api/session_controller_test.rb`
  - currently generated placeholder coverage only
- `test/controllers/api/users_controller_test.rb`
  - currently generated placeholder coverage only
- `test/controllers/api/posts_controller_test.rb`
  - currently generated placeholder coverage only

Model test files exist for users, posts, likes, and follows, but currently only
contain placeholder test blocks.

Manual smoke coverage exists in `docs/behavior-smoke-checks.md`. It covers the
most important end-to-end flows:

- guest login and logout
- dashboard load and refresh
- followed-user feed behavior
- recommended-user follow behavior
- post creation and deletion
- like and unlike behavior
- media rendering by post type

## Current Test Data

The fixture files in `test/fixtures` still use simple placeholder records. They
are enough for Rails fixture loading but are not yet shaped around app behavior.

Known fixture gaps:

- `follows.yml` includes duplicate self-follow-style rows.
- `likes.yml` includes duplicate rows for the same user and post ids.
- `posts.yml` does not clearly distinguish viewer-owned, followed-user, and
  unrelated posts.
- fixtures do not include Active Storage attachment records or fixture files for
  upload behavior.

Several newer controller tests build records directly in setup instead of using
fixtures. That is acceptable for focused behavior tests, but Phase 7 should keep
that choice intentional: use direct setup when the behavior needs precise data,
and improve fixtures only where shared test data makes the suite easier to read.

## Coverage Gaps

### Auth and Sessions

Needed coverage:

- successful login returns the current user payload
- invalid login returns `401` and the expected JSON error shape
- logout clears the session and returns the previous user payload
- logout without a current user returns `404`
- signup logs in the new user
- invalid signup returns validation errors

### Users

Needed coverage:

- users index requires login
- users index excludes the current user
- users index excludes already-followed users
- users index returns recommended users in the frontend's expected object shape
- users show requires login
- users show returns the requested user payload
- missing users show behavior is either documented as current behavior or
  normalized in a backend cleanup PR before asserting it

### Follows

Existing follow/feed tests protect the main regression. Remaining useful
coverage:

- follow requires login
- duplicate follow returns `422`
- missing followee behavior is documented or normalized
- unfollow requires login
- unfollow missing relationship returns `404`
- response shape stays compatible with the posts index payload

### Posts

Needed coverage:

- index requires login
- index includes current-user posts
- index includes followed-user posts
- index excludes unrelated-user posts
- show returns the expected post payload
- missing post behavior is documented or normalized
- create requires login
- create succeeds for text/link/quote style payloads
- create rejects invalid payloads
- update and destroy are limited to the current user's posts

### Likes

Likes already have the strongest controller coverage. Remaining useful coverage:

- response JSON includes the fields used by TanStack Query cache updates
- unlike cannot remove another user's like
- fixtures or helper setup can make the test intent easier to scan

### Active Storage Uploads

Needed coverage:

- post creation can attach an uploaded image through `post[image]`
- post JSON includes `image_url` when an image is attached
- user avatar behavior is covered if an API path is added for avatar uploads
- the app does not depend on legacy Paperclip columns

User avatar uploads are currently seed-driven rather than exposed through a
dedicated API update route. Phase 7 should not invent new avatar API behavior
just to test it.

### Frontend Smoke Coverage

The current manual checklist is useful and should stay lightweight. A future PR
can improve repeatability with either:

- a documented command-driven smoke script, if the app can be started reliably
  in local automation
- a browser checklist with expected results, if full automation would add too
  much setup cost

## Recommended Phase 7 Order

1. Replace placeholder auth/session tests with real request behavior.
2. Add users and follows behavior coverage around recommendations and feed
   updates.
3. Add posts index/create/update/delete coverage around the dashboard feed.
4. Fill small likes test gaps and improve readability where useful.
5. Add Active Storage upload tests for supported post media behavior.
6. Document or automate frontend smoke checks.
7. Run the complete focused suite and close out Phase 7.

## Guardrails

- Prefer behavior tests over implementation tests.
- Preserve current API response shapes unless a PR intentionally changes and
  coordinates the frontend contract.
- Keep each PR focused on one controller or behavior slice.
- Avoid adding frontend test infrastructure until it clearly improves confidence
  more than it increases maintenance.
- Keep seed-data improvements separate from test fixture improvements unless a
  PR explicitly needs both.
