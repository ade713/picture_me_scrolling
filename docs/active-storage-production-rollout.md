# Active Storage and Legacy Media

The app now uses Active Storage as the only runtime media attachment path.
Paperclip compatibility code, migration rake tasks, old configuration, and old
Paperclip database columns have been removed.

## Current Production Status

The original Heroku production app and its historical data are no longer
active, and there is no known Postgres backup or export from that deployment.
The current application is deployed separately on Render at
`picturemescrolling.com`.

The old production and development S3 buckets still exist. Because the
production database is not available, those files should be treated as
archive/manual recovery media rather than an active app migration dependency.

## Current Media Path

- User avatars use `User#avatar`.
- Post media uses `Post#image`.
- Runtime URLs are emitted from Active Storage-backed Jbuilder fields.
- Production Active Storage defaults to the `amazon` service and can be
  overridden with `ACTIVE_STORAGE_SERVICE`.

Production Active Storage expects:

```sh
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_REGION
S3_BUCKET_NAME
```

## Legacy S3 Recovery

Use this path only if old media needs to be manually recovered or replaced from
the archived S3 bucket.

Recommended recovery steps:

1. Inventory the old production S3 bucket.
2. Confirm the old key structure, such as:

   ```text
   users/avatars/000/000/001/original/avatar.png
   posts/images/000/000/123/original/photo.jpg
   ```

3. Export a manifest with:

   - S3 bucket
   - S3 key
   - inferred model, such as `users` or `posts`
   - inferred old record ID
   - attachment name, such as `avatar` or `image`
   - filename
   - content type
   - size

4. Decide the recovery strategy:

   - preserve the media files only
   - manually attach selected files to new seed/demo records
   - replace missing media with new assets

The S3-only path cannot recover usernames, passwords, post captions, follows,
likes, timestamps, or author relationships unless that data exists somewhere
outside the lost production database.

## Paperclip Removal Verification

Paperclip compatibility was removed in the Phase 6 follow-up cleanup. Verified:

- The app boots without Paperclip loaded.
- `bundle check` passes.
- Active Storage tables are present.
- Focused likes/follows controller tests pass.
- The frontend bundle builds successfully.
- Old S3 files remain available as archive/manual recovery media if needed.
