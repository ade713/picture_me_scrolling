# Phase 6 Verification Closeout

Phase 6 modernized and documented the Rails/API backend surface after the
frontend state, router, and build layers were stabilized.

## Completed Cleanup

- Documented the Rails backend API surface in
  `docs/backend-modernization-inventory.md`.
- Hardened likes API error handling so expected invalid states return JSON
  responses instead of raising or nil-crashing.
- Normalized API error status declarations to Rails symbolic statuses.
- Updated API route documentation to match the actual Rails route table and
  frontend API client paths.
- Documented the Active Storage/Paperclip cleanup path and decided that the old
  production S3 bucket is archive/manual recovery media.
- Documented backend production-readiness requirements in
  `docs/backend-production-readiness.md`.
- Made production Active Storage service selection configurable through
  `ACTIVE_STORAGE_SERVICE`, preserving the existing `amazon` default.

## Verification

Commands run:

```sh
bin/rails test test/controllers/api/likes_controller_test.rb test/controllers/api/follows_controller_test.rb
SECRET_KEY_BASE=dummy RAILS_ENV=production ACTIVE_STORAGE_SERVICE=local bin/rails runner 'puts Rails.application.config.active_storage.service'
SECRET_KEY_BASE=dummy RAILS_ENV=production S3_REGION=us-east-1 S3_BUCKET_NAME=dummy AWS_ACCESS_KEY_ID=dummy AWS_SECRET_ACCESS_KEY=dummy bin/rails runner 'puts Rails.application.config.active_storage.service'
npm run build
```

Results:

- Focused Rails controller tests passed: 8 runs, 36 assertions, 0 failures.
- Production Active Storage override resolved to `local`.
- Production Active Storage default resolved to `amazon` when S3 env vars were
  present.
- Webpack compiled successfully.

## Known Warnings

Rails boot/test commands still emit these known warnings:

- `config.active_support.cache_format_version = 6.1` is deprecated for Rails
  7.2.
- `secret_key_base` configured through `Rails.application.secrets` is deprecated
  for Rails 7.2.
- Some locally installed gems report missing native extensions in this machine's
  shell environment.

These warnings are documented in `docs/backend-production-readiness.md` and
should be handled in focused follow-up work.

## Remaining Follow-Up

- Choose a future production hosting target.
- Decide the production secrets strategy before replacing `config/secrets.yml`.
- Revisit Rails cache format after production cache storage is known.
- Revisit Uglifier/Sprockets when the frontend asset boundary moves closer to
  Vite.

## Post-Closeout Paperclip Removal

Paperclip compatibility was removed after the Phase 6 closeout once old
production S3 media was accepted as archive/manual recovery material.

Verification commands run:

```sh
bundle check
bin/rails db:migrate
bin/rails test test/controllers/api/likes_controller_test.rb test/controllers/api/follows_controller_test.rb
bin/rails runner 'puts defined?(Paperclip).inspect'
npm run build
```

Results:

- Bundler reported that Gemfile dependencies are satisfied.
- The Paperclip column removal migration ran successfully.
- Focused controller tests passed: 8 runs, 36 assertions, 0 failures.
- Rails runner returned `nil` for `defined?(Paperclip)`.
- Webpack compiled successfully.
