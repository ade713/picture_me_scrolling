# Phase 11 Backend Performance Inventory

Phase 11 starts the production-readiness track after frontend modernization.
This inventory maps the current backend performance and production-readiness
surface before behavior or query changes are made.

## Scope

- Controllers, models, Jbuilder views, routes, schema indexes, production
  config, and existing test coverage.
- Query-heavy paths that should be measured or simplified before launch.
- No behavior changes in this inventory pass.

## Controller Findings

`Api::PostsController` is relatively lean. It mostly owns request
orchestration:

- creates posts with the current user as author
- renders the feed index
- loads current-user-owned posts for update/delete authorization
- renders JSON validation and ownership errors
- permits post params

The heavier feed behavior currently lives in shared `ApplicationController`
private helpers:

- `paginated_feed_for(user)`
- `sorted_feed_posts_for(user)`
- `feed_pagination(total_count)`

This should move out of `ApplicationController` in a focused follow-up. Good
candidate shapes are:

- `Post.feed_for(user)` or `Post.visible_to(user)` for the feed relation
- a small `FeedQuery` object if pagination and request params start to make the
  model API noisy

Keep request-param parsing for `page` and `per_page` close to the controller or
query object, not hidden in generic model behavior.

`Api::FollowsController` reuses the same feed rendering after follow/unfollow.
That keeps frontend cache reset behavior simple, but it means feed response
performance also affects follow/unfollow response time.

`Api::UsersController#index` currently builds recommended users with:

```ruby
User.all - current_user.followee_users - [current_user]
```

This is readable for the current app size, but it loads more records than
needed as user volume grows. It should eventually become a database-backed
exclusion query.

## Model Findings

`Post` owns associations and simple relationship helper methods:

- `likers_ids`
- `followers_ids`

Both helpers manually build arrays through associations. They are easy to read
but can become noisy when called once per feed item from Jbuilder. Prefer
precomputed sets or database-backed relationship checks in the feed response
before changing frontend response fields.

`User` owns auth/session behavior and associations. `User#recommended_follows`
is still empty. Confirm whether it is unused before removing or replacing it in
the recommended-users follow-up.

`Like` and `Follow` have model-level uniqueness validations, but schema-level
composite unique indexes are still absent. Add database constraints in the
index-focused PR so duplicate rows cannot slip in under concurrent requests.

## Jbuilder Findings

The post partial is the highest-risk serialization path:

```ruby
json.author post.author.username
json.followed post.followers_ids.include?(current_user.id)
json.author_avatar post.author.avatar.attached? ? url_for(post.author.avatar) : nil
json.likes post.likes.count
json.liked post.likers_ids.include?(current_user.id)
```

Potential costs on feed pages:

- author lookup per post
- avatar attachment lookup per author
- follower lookup per post author
- liker lookup per post
- likes count per post
- Active Storage URL generation per media/avatar field

Recommended order:

1. Preserve the existing response fields.
2. Preload authors and attachments where useful.
3. Compute current-user liked/followed sets once per feed response.
4. Reassess whether Jbuilder remains sufficient after query cleanup.
5. Consider Blueprinter only as a separate follow-up if readability or measured
   performance still justifies a serializer migration.

## Feed Query and Pagination

Current feed shape:

- current user posts plus followed-user posts
- newest first
- deterministic `id` tie-breaker
- response includes `posts`, `post_ids`, and `pagination`

`post_ids` is important because JavaScript does not preserve display order for
integer-like object keys. Keep this response contract stable.

The next feed PR should move query ownership out of `ApplicationController`
before deeper optimization. This will make later database/index work easier to
review.

## Schema and Index Findings

Current useful indexes:

- `users.username`, unique
- `users.session_token`, unique
- `posts.author_id`
- `likes.post_id`
- `likes.user_id`
- `follows.followee_id`
- `follows.follower_id`
- Active Storage default blob/attachment indexes

Likely follow-up indexes:

- composite unique index on `likes(user_id, post_id)`
- composite unique index on `follows(follower_id, followee_id)`
- composite feed index on `posts(author_id, created_at, id)` or a similar
  index chosen after the feed query shape is finalized

Do the migration work after the query-boundary cleanup confirms the exact query
shape.

## Production Config Findings

Production config currently includes:

- `config.public_file_server.enabled` controlled by `RAILS_SERVE_STATIC_FILES`
- long-lived immutable cache headers for public files
- `config.assets.compile = false`
- `config.assets.js_compressor = :uglifier`
- `RAILS_LOG_TO_STDOUT` support
- Active Storage service selected from `ACTIVE_STORAGE_SERVICE`, defaulting to
  `amazon`

`config.force_ssl` remains commented out. Review it after hosting is selected so
SSL, secure cookies, and proxy behavior are handled together.

S3 config currently reads:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_REGION`
- `S3_BUCKET_NAME`
- optional `S3_BUCKET_NAME_DEV`

Production `SECRET_KEY_BASE` is environment-backed through `config/secrets.yml`.
This should be revisited with the selected hosting/secret-management approach,
but production secrets are not committed directly.

No tracked `.DS_Store` files were found during this inventory pass.

## Health and Monitoring Findings

Phase 11-8 adds `GET /up` as the dedicated health/status endpoint and documents
it as the selected Render health-check path.

Useful minimum health behavior:

- Rails app boots
- database is reachable
- response does not expose sensitive data

Monitoring/error reporting is not configured yet. Choose a minimum launch
approach during the observability PR:

- host-provided logs only
- Sentry
- Honeybadger
- Rollbar
- another selected provider

## Test Coverage Notes

Existing backend tests already cover several important contracts:

- posts feed membership and pagination
- posts newest-first ordering with `id` tie-breaker
- post create/update/delete ownership behavior
- follow/unfollow feed refresh behavior
- like/unlike behavior and missing-record errors
- recommended users excluding current/followed users

Future test additions should focus on:

- feed query extraction preserving response shape
- index/uniqueness behavior for likes and follows
- Jbuilder relationship fields after preloading/set-based cleanup
- health-check endpoint behavior if one is added
