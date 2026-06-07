# Backend Modernization Inventory

This inventory supports Phase 6 of the modernization plan. Its purpose is to
map the current Rails API surface before changing behavior, so follow-up PRs can
stay small and reviewable.

## Current Backend Shape

The app has a compact Rails JSON API:

- `ApplicationController` owns browser/session helpers and the shared
  `require_logged_in` guard.
- API controllers live under `app/controllers/api`:
  - `sessions_controller.rb`
  - `users_controller.rb`
  - `posts_controller.rb`
  - `likes_controller.rb`
  - `follows_controller.rb`
- JSON responses are rendered through Jbuilder views under `app/views/api`.
- Models are `User`, `Post`, `Like`, and `Follow`.
- Active Storage is the canonical runtime media path for `User#avatar` and
  `Post#image`.
- Paperclip remains installed for migration compatibility until production/data
  recovery decisions are complete.

## Routes

Current API routes:

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/session`
- `DELETE /api/session`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/users/:user_id/follow`
- `DELETE /api/users/:user_id/follow`
- `POST /api/posts/:post_id/like`
- `DELETE /api/posts/:post_id/like`

The singleton `session`, `follow`, and `like` resources match the frontend API
client and should stay stable unless the frontend is updated in the same PR.

## Controller Findings

### Error Response Consistency

The controllers currently return JSON arrays for errors, which matches existing
frontend expectations. The status declaration style varies:

- symbolic statuses: `:unauthorized`, `:unprocessable_entity`, `:not_found`
- numeric statuses: `401`, `422`, `404`

Recommended cleanup: normalize to symbolic statuses while preserving the array
response shape.

### Nil and Bang Paths

The follows controller has already been hardened to return useful JSON errors.

The likes controller still has the riskiest paths:

- `Like#save!` can raise instead of returning a JSON validation error.
- `destroy` assumes the like exists before calling `@like.post`.
- duplicate likes currently depend on exception behavior instead of an explicit
  API response.

The users controller also uses `User.find(params[:id])`, which raises if the
record is missing. That may be acceptable for internal routes, but API behavior
would be clearer with an explicit JSON not-found response.

The posts controller mostly uses guarded `find_by` paths. One follow-up question
is whether `destroy` should use `destroy` instead of `delete` so callbacks remain
available if the model later needs them.

## Jbuilder Findings

The current post partial calculates relationship metadata directly from model
methods:

- `post.followers_ids.include?(current_user.id)`
- `post.likers_ids.include?(current_user.id)`

This is readable for the current app size, but it can become query-heavy as feed
size grows. Keep response shape stable for now. If performance work is needed
later, optimize the model/query layer without changing frontend field names.

Active Storage fields currently emitted:

- `image_url`
- `author_avatar`
- `avatar_url`

These should remain stable unless the frontend query layer is updated in the
same PR.

## Model Findings

`User` and `Post` use Active Storage attachments:

- `has_one_attached :avatar`
- `has_one_attached :image`

Paperclip schema comments and commented validation lines still exist in the
models. They are not runtime behavior, but they are visual noise. Remove them
only after the Paperclip cleanup criteria are satisfied.

`Post#likers_ids` and `Post#followers_ids` manually build arrays. These can be
simplified later with Rails collection helpers or query plucks, but this is not
necessary before controller hardening.

`User#recommended_follows` is empty and appears unused. Confirm with a usage scan
before removing it.

## Active Storage and Paperclip Findings

Keep the following until the production/data recovery plan is resolved:

- `paperclip` gem
- Paperclip compatibility initializers
- Paperclip migration rake tasks
- old Paperclip columns in the database
- docs that explain production media recovery

Related document: `docs/active-storage-production-rollout.md`.

The likely cleanup order is:

1. Confirm production/data recovery posture.
2. Confirm no environment needs Paperclip migration compatibility.
3. Remove Paperclip wrappers/config.
4. Remove old columns in a dedicated migration.

## Environment and Config Findings

Production currently uses:

- `config.active_storage.service = :amazon`
- S3 settings from environment variables in `config/storage.yml`
- `config.assets.js_compressor = :uglifier`
- Rails 7-era compatibility settings such as `config.cache_classes`

Follow-up config work should focus on low-risk Rails 7.2 warnings and
production-readiness settings. Avoid deployment-provider-specific assumptions
until production hosting is chosen.

## Recommended Phase 6 Follow-Up PRs

1. Controller response and error handling cleanup:
   - normalize status declarations
   - harden likes create/destroy
   - consider explicit user/post not-found responses
2. Rails routing and API convention cleanup:
   - verify singleton route conventions
   - remove stale comments
   - preserve frontend API paths

Status: completed in Phase 6-3. The singleton `session`, nested singleton
`follow`, and nested singleton `like` routes were kept stable for the current
frontend API client.
3. Active Storage and Paperclip cleanup plan:
   - document exact removal criteria
   - keep compatibility code until production/data recovery is settled
4. Environment and production readiness cleanup:
   - review Rails deprecations
   - review S3/credentials assumptions
   - document hosting-neutral production requirements
5. Phase 6 verification and closeout:
   - run focused Rails tests
   - run boot/asset checks
   - update docs and plan status
