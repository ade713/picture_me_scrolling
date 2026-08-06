# Backend Production Readiness

This note captures the Phase 11-6 production config, hosting, and secrets
review together with the selected Render deployment path.

## Current Posture

- Render is the selected initial production hosting target.
- The application is deployed at `picturemescrolling.com`; the `www` hostname
  redirects to the canonical root domain.
- The previous Heroku app/account is gone.
- Active Storage is the runtime media path.
- Paperclip compatibility has been removed.
- Old S3 files are archive/manual recovery media, not an active migration
  dependency.
- Render setup details live in `docs/render-production-setup.md`.
- Transactional account email is delivered through Resend from the verified
  `accounts.picturemescrolling.com` subdomain.

## Required Production Environment

The selected host must provide:

- `SECRET_KEY_BASE`
- `RAILS_MASTER_KEY` for Rails encrypted credentials
- `DATABASE_URL` or equivalent PostgreSQL database config
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_REGION`
- `S3_BUCKET_NAME`
- `ACTIVE_STORAGE_SERVICE`, optional, defaults to `amazon`
- `RAILS_SERVE_STATIC_FILES`, if Rails should serve compiled public assets
- `RAILS_LOG_TO_STDOUT`, if the host expects STDOUT logging
- `APP_HOST`
- `SMTP_ADDRESS`
- `SMTP_PORT`, optional, defaults to `587`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `MAILER_FROM_ADDRESS`

Development can also use:

- `ACTIVE_STORAGE_SERVICE`, optional, defaults to `local`
- `S3_BUCKET_NAME_DEV`, if using the `amazondev` Active Storage service

## Production Config Review

`config/environments/production.rb` supports the current Rails deployment:

- eager loading and class caching are enabled
- full error reports are disabled
- controller caching is enabled
- static file serving is environment-controlled through
  `RAILS_SERVE_STATIC_FILES`
- public static files use long-lived immutable cache headers when Rails serves
  them
- asset fallback compilation is disabled with `config.assets.compile = false`
- logs can go to STDOUT through `RAILS_LOG_TO_STDOUT`
- Active Storage service is environment-controlled with an `amazon` default

Keep `config.assets.compile = false` for production. The deploy process should
build the JavaScript bundle and precompile Rails assets before release.

`config.force_ssl` is still commented out. Enable it only after the hosting
target is selected and proxy/SSL behavior is confirmed, because secure cookies,
HSTS, redirects, and load-balancer headers should be handled together.

## Active Storage and S3

Production Active Storage currently uses the `amazon` service unless
`ACTIVE_STORAGE_SERVICE` overrides it.

The production S3 bucket should have:

- private object access by default
- credentials scoped to the app's required bucket actions
- region matching `S3_REGION`
- CORS rules that allow browser uploads/downloads only from the production app
  origin when direct browser access is needed
- lifecycle expectations documented, including whether old demo media can be
  deleted

Production smoke verification passed for:

- avatar upload and render
- photo post upload and render
- audio/video upload and playback
- generated Active Storage URLs in the feed and post show responses

## Secrets

Production `SECRET_KEY_BASE` is read from the environment through
`config/secrets.yml`. Rails encrypted credentials are also initialized through
`config/credentials.yml.enc`. The matching master key was generated locally,
and its value should be copied into Render as `RAILS_MASTER_KEY`; Render should
store that value, not generate it.

Keep platform environment variables as the primary production secret path for
this deployment. Do not commit provider credentials, local `.env` files,
generated keys, database dumps, storage artifacts, or `config/master.key`.

The current `.gitignore` already ignores:

- `/storage/*`
- `/log/*`
- `/tmp/*`
- `/config/application.yml`
- `/config/master.key`
- `/config/credentials/*.key`
- `.DS_Store`
- `node_modules/`
- generated bundle artifacts

## Hosting Decision

Render is the selected first production target because it supports a small
Rails/PostgreSQL deployment with managed logs, environment variables, custom
domains, and straightforward dashboard configuration.

The initial target is a cost-conscious setup: Starter web service,
Basic-256mb Postgres, and S3-backed Active Storage media.

If hosting is revisited later, evaluate each candidate for:

- Rails and Ruby version support
- PostgreSQL support, backups, and restore workflow
- persistent filesystem assumptions, especially because runtime media should
  live in S3 rather than app disk
- environment variable and secret management
- SSL/custom domain support
- deploy complexity and rollback workflow
- build steps for npm, Webpack, Sprockets, and Rails asset precompile
- log access and retention
- metrics, uptime checks, and error visibility
- pricing for low-traffic portfolio usage

Render-specific setup is documented separately. Keep secrets and generated
production artifacts out of the repo.

## Launch Checklist

Before production release:

1. Use Render Starter web service and Basic-256mb Postgres for the initial
   production deployment.
2. Configure `SECRET_KEY_BASE`, database credentials, and required AWS/S3 env
   vars in the host.
3. Confirm production asset build commands run successfully:

   ```sh
   NODE_ENV=production npm run build
   RAILS_ENV=production bin/rails assets:precompile
   ```

4. Decide whether Rails serves assets with `RAILS_SERVE_STATIC_FILES` or the
   host/CDN serves the precompiled public assets.
5. Configure SSL and revisit `config.force_ssl`.
6. Run database migrations.
7. Seed demo data only when intended for the deployed environment.
8. Smoke-check auth, feed pagination, follows, likes, post create/edit/delete,
   and media upload/render.
9. Confirm logs and errors are visible through the selected monitoring path.

## Health Check And Monitoring

Phase 11-8 adds `GET /up` as the production health endpoint. It returns `{ "status": "ok" }` only after Rails can execute a lightweight database query. If the database check fails, it returns HTTP 503 with `{ "status": "unavailable" }`. The response intentionally avoids secrets, environment names, hostnames, database names, versions, or exception details.

Use Render's built-in logs and metrics as the minimum launch monitoring path. Add external error reporting such as Sentry, Honeybadger, or Rollbar later if production error visibility needs exceed what Render provides.

## Deferred

- `render.yaml` remains deferred until repo-managed Render infrastructure is
  clearly useful.
- Moving all production secrets into Rails credentials can be revisited after
  the first Render deployment is stable.
- Vite remains a separate future build-tooling project.
