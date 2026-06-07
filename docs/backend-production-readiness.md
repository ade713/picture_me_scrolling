# Backend Production Readiness

This note captures the Phase 6-5 production-readiness review. The goal is to
make low-risk backend config improvements while avoiding assumptions about a
future hosting provider.

## Current Posture

- Production hosting has not been reselected.
- The previous Heroku app/account is gone.
- Active Storage is the runtime media path.
- The old production S3 bucket is archive/manual recovery media.
- Paperclip removal is planned as a focused follow-up PR.

## Environment Variables

The app currently expects these production environment variables:

- `SECRET_KEY_BASE`
- `DATABASE_URL` or equivalent PostgreSQL database config
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_REGION`
- `S3_BUCKET_NAME`
- `ACTIVE_STORAGE_SERVICE`, optional, defaults to `amazon`
- `RAILS_SERVE_STATIC_FILES`, if Rails should serve compiled public assets
- `RAILS_LOG_TO_STDOUT`, if the deployment target expects STDOUT logging

Development can also use:

- `ACTIVE_STORAGE_SERVICE`, optional, defaults to `local`
- `S3_BUCKET_NAME_DEV`, if using the `amazondev` Active Storage service

## Config Decisions

Production Active Storage now reads `ACTIVE_STORAGE_SERVICE` with an `amazon`
default. This preserves the current S3 behavior while making the hosting/storage
choice explicit for future production setup.

`config.assets.compile = false` remains correct for production. The frontend
bundle must be built before deploy, and Rails should serve precompiled assets or
hand them to the selected platform/static file layer.

`config.assets.js_compressor = :uglifier` remains for now because Sprockets is
still part of the production asset path. Revisit this during the future Vite or
asset-pipeline cleanup.

## Rails 7.2 Deprecation Warnings

Rails currently emits two known deprecation warnings during boot/test runs:

- `config.active_support.cache_format_version = 6.1`
- `secret_key_base` configured through `Rails.application.secrets`

These are not fixed in Phase 6-5 because both deserve focused follow-up:

- Cache format changes should be verified with the selected cache store and
  production rollout plan.
- Secret handling should move away from `config/secrets.yml` after the hosting
  target and credentials strategy are chosen.

## Follow-Up Candidates

- Remove Paperclip compatibility in its own PR.
- Decide whether production secrets should use Rails credentials, platform env
  vars, or another provider-specific secret store.
- Decide whether to keep Uglifier until Vite migration or replace it with a more
  modern Sprockets-compatible compressor.
- Revisit Rails cache format after production cache storage is known.
- Remove committed `.DS_Store` files from config/docs/assets in a small cleanup
  PR if they are still tracked.
