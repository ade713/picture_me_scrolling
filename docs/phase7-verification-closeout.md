# Phase 7 Verification Closeout

Phase 7 added focused test coverage around the app behavior most likely to
regress as frontend and backend modernization continues.

## Completed Coverage

- Documented the current test surface and remaining gaps in
  `docs/test-coverage-inventory.md`.
- Replaced generated auth/session placeholders with behavior coverage for:
  - login
  - invalid login
  - authenticated protected endpoint access
  - logout
  - logout without a current user
  - signup validation and duplicate usernames
- Added user and follow behavior coverage for:
  - users index/show login requirements
  - recommended-user filtering
  - follow/unfollow feed responses
  - duplicate follows
  - missing followees and missing follow relationships
- Replaced generated posts controller placeholders with behavior coverage for:
  - posts feed composition
  - show payloads
  - create/update/delete behavior
  - ownership checks
  - invalid post params
- Expanded likes API coverage for:
  - like/unlike behavior
  - duplicate likes
  - missing posts and missing likes
  - login requirements
  - response payload fields used by frontend cache updates
- Added Active Storage upload coverage for supported post media paths:
  - create with uploaded media
  - update with uploaded media
  - blob and attachment creation
  - returned `image_url` values
  - independence from legacy Paperclip columns
- Added a lightweight manual frontend smoke checklist in
  `docs/frontend-smoke-checklist.md`.

## Verification

Commands run:

```sh
bin/rails test \
  test/controllers/api/session_controller_test.rb \
  test/controllers/api/users_controller_test.rb \
  test/controllers/api/follows_controller_test.rb \
  test/controllers/api/posts_controller_test.rb \
  test/controllers/api/likes_controller_test.rb

npm run build
```

Results:

- Focused Rails controller tests passed: 40 runs, 208 assertions, 0 failures.
- Webpack compiled successfully.

## Intentional Manual Coverage

The frontend smoke pass remains manual for now. The app has a repeatable
browser checklist, but not enough frontend test infrastructure yet to justify a
heavier browser automation stack.

Manual checks are documented in `docs/frontend-smoke-checklist.md` and cover:

- login/logout and refresh while logged in
- dashboard feed loading
- media rendering
- follow/unfollow behavior
- like/unlike behavior
- text and media post creation
- post deletion

## Known Warnings

Rails boot/test commands still emit these known warnings:

- `config.active_support.cache_format_version = 6.1` is deprecated for Rails
  7.2.
- `secret_key_base` configured through `Rails.application.secrets` is deprecated
  for Rails 7.2.
- Some locally installed gems report missing native extensions in this machine's
  shell environment.

Webpack still reports that `baseline-browser-mapping` data is more than two
months old. This warning does not currently block the build.

## Remaining Follow-Up

- Add Phase 7.5 component-focused frontend behavior tests before Phase 8 UI/CSS
  cleanup.
- Defer shared Rails test helper extraction until after the backend test suite
  has settled.
- Keep browser smoke checks manual unless repeated frontend regressions justify
  heavier automation.
