# Active Storage Production Rollout

This plan covers the production rollout for migrating media from Paperclip to
Active Storage. The code can be merged and deployed before the data migration is
run, but the production data migration should be a deliberate manual step.

## Current Production Status

The original Heroku production app and custom domain are no longer active, and
there is no known production Postgres backup or export.

The production and development S3 buckets still exist. Because the production
database is not available, the existing production S3 bucket can support media
recovery, but it cannot support a complete app data migration by itself.

The Paperclip-to-Active Storage rake task requires database rows with Paperclip
columns such as `avatar_file_name` and `image_file_name`. Because there is no
known production database backup, the old production S3 bucket should be treated
as an archive/manual recovery source instead of a reason to keep Paperclip in
the app long term.

This does not block merging the Active Storage migration PR. It only means the
production Paperclip data migration is not expected to run unless a production
database backup appears later.

## Goals

- Deploy the Active Storage-compatible app code safely.
- Copy existing Paperclip media into Active Storage records if a Paperclip-backed
  database is available.
- Preserve production S3 media for possible manual recovery or replacement if
  old media is needed later.
- Verify current Active Storage-backed media works before removing Paperclip
  compatibility code.
- Remove Paperclip compatibility in a focused follow-up PR once this archive
  posture is accepted.

## Pre-Merge Checklist

- Confirm the Active Storage migration PR includes the Rails, frontend, and rake
  task compatibility work.
- Confirm the PR does not remove Paperclip columns or old production media.
- Confirm the migration task is not wired into deploy or database migrations.
- Confirm production rollout commands and verification steps are ready.

## Production Config Checklist

Production Active Storage uses the `amazon` service in `config/storage.yml`.
Confirm these env vars are set before running the migration:

```sh
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_REGION
S3_BUCKET_NAME
```

The old Paperclip config references lowercase env vars such as `s3_bucket`,
`s3_access_key_id`, `s3_secret_access_key`, and `s3_region`. The Active Storage
config and migration task use the uppercase env vars above, so production must
have the uppercase values.

## Backup

Take a production database backup before running the migration if a production
database exists.

If the app is deployed on Heroku:

```sh
heroku pg:backups:capture --app picmes
```

Confirm the backup completed and that the restore process is understood before
continuing.

If no production database exists, skip the migration task and move to the
S3-only recovery path below.

## Deploy

1. Merge the Active Storage migration PR.
2. Deploy the app code to production.
3. Verify the app boots before running the migration task.

Minimum smoke check:

- Homepage loads.
- Login works.
- Dashboard loads.
- Server logs do not show new boot or request errors.

## Pre-Migration Counts

Capture production counts before running the migration:

```ruby
{
  users_with_paperclip_avatar: User.where.not(avatar_file_name: nil).count,
  posts_with_paperclip_image: Post.where.not(image_file_name: nil).count,
  user_avatar_attachments: ActiveStorage::Attachment.where(record_type: "User", name: "avatar").count,
  post_image_attachments: ActiveStorage::Attachment.where(record_type: "Post", name: "image").count,
  blobs: ActiveStorage::Blob.count,
  unattached_blobs: ActiveStorage::Blob.unattached.count
}
```

Save the output in the rollout notes.

If these queries cannot run because there is no production database, do not run
the Paperclip migration task.

## Run Migration

Only run this task against an environment that has the old Paperclip-backed
database rows.

Preferred command:

```sh
bundle exec rake migrate_paperclip:move_attachments
```

Compatibility command for older notes or runbooks:

```sh
bundle exec rake migrate_paperclip:move_data
```

`migrate_paperclip:move_data` is only a wrapper. The canonical task is
`migrate_paperclip:move_attachments`.

The migration task is safe to rerun for records that already have Active Storage
attachments because it skips already-attached records.

## S3-Only Recovery Path

Use this path if no production database can be restored, but the old production
S3 bucket still exists.

The goal is to preserve and inventory media, then decide whether to rebuild demo
or production-like records from the files.

Recommended recovery steps:

1. Inventory the production S3 bucket.
2. Confirm the Paperclip key structure, such as:

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
   - rebuild seed/demo records with recovered media
   - create placeholder users/posts from inferred S3 paths

The S3-only path cannot recover usernames, passwords, post captions, follows,
likes, timestamps, or author relationships unless that data exists somewhere
outside the lost production database.

## Post-Migration Verification

Run the count query again after the task completes.

Expected results:

- Active Storage attachment counts should increase to match migrated Paperclip
  records.
- `unattached_blobs` should ideally be `0`.
- Any reported migration errors should be reviewed by model and record ID.

Spot-check production UI:

- User avatars render.
- Photo posts render.
- GIF posts render.
- Video posts render.
- Login, dashboard, and feed still work.
- Create a new media post if production write testing is acceptable.

## Rollback Posture

Do not remove Paperclip columns during this rollout.

If some records fail to copy, prefer fixing config/data issues and rerunning the
task. Restore the production database backup only if the migration corrupts data
or leaves production in an unsafe state.

Because the old Paperclip columns remain in place, cleanup can happen later after
production has been verified and stable.

## Later Cleanup

Paperclip compatibility should be removed in a focused follow-up PR once every
criterion below is true:

- Production hosting has been chosen or explicitly deferred.
- The previous production database is treated as unrecoverable unless a backup
  appears later.
- The old production S3 bucket is treated as archive/manual recovery media, not
  an active app migration dependency.
- Current user avatars and post media have been verified through Active Storage
  URLs.
- No active runbook, deployment task, or recovery plan depends on Paperclip.
- Rollback no longer requires the old Paperclip columns or migration tasks.

Until that follow-up PR is ready, keep:

- `paperclip` in the Gemfile.
- `config.paperclip_defaults` in `config/application.rb`.
- `config/initializers/paperclip_attachment_patch.rb`.
- `config/initializers/paperclip_validators_patch.rb`.
- `lib/tasks/migrate_paperclip_attachments.rake`.
- `lib/tasks/migrate_paperclip_data.rake`.
- old Paperclip columns such as `avatar_file_name` and `image_file_name`.

In the follow-up removal PR:

1. Remove old Paperclip gems and configuration.
2. Remove Paperclip compatibility initializers.
3. Remove `migrate_paperclip:move_data` compatibility wrapper.
4. Remove the migration task if it is no longer needed.
5. Remove Paperclip columns in a dedicated database migration.
6. Remove stale Paperclip schema comments or commented validation lines from the
   models.
7. Update documentation so Active Storage is the only canonical media path.
