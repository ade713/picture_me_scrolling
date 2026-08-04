# Render Production Setup

Phase 11-7 uses Render as the first production hosting target. The goal is a
small, cost-conscious deployment that can be upgraded later without committing
secrets or provider credentials to the repo.

## Initial Render Shape

Use dashboard-managed services first:

- Web Service: Render Starter instance type
- Database: Render Postgres Basic-256mb
- Media: AWS S3 through Active Storage
- Infrastructure as code: defer `render.yaml` until repo-managed services are
  clearly useful

This keeps the first production setup explicit and avoids accidentally
provisioning the wrong paid resources from a blueprint.

## Repository Changes

This PR adds `bin/render-build.sh` as the Render build command. It performs the
frontend and Rails asset build steps required by the current Webpack/Sprockets
setup:

```sh
bundle install
npm ci
NODE_ENV=production npm run build
bin/rails assets:precompile
bin/rails assets:clean
```

Production database config now prefers `DATABASE_URL`, which Render provides for
Postgres connections. The existing `FSP_DATABASE_PASSWORD` fallback remains for
non-Render deployments.

Rails encrypted credentials are initialized through `config/credentials.yml.enc`.
The matching `config/master.key` stays local and ignored; copy its value into
Render as `RAILS_MASTER_KEY` rather than committing it.

## Render Service Settings

Create the Render Postgres database first, then create the Rails web service.
Use the same region for both services.

Recommended web service settings:

| Setting | Value |
| --- | --- |
| Runtime | Ruby |
| Instance type | Starter |
| Build command | `bin/render-build.sh` |
| Pre-deploy command | `bin/rails db:migrate` |
| Start command | `bin/rails server` |
| Health check path | `/up` |
| Auto deploy | Enabled after first successful manual deploy |

The pre-deploy command keeps migrations out of the build step. Render supports
pre-deploy commands on paid instance types, which fits the planned Starter web
service.

## Environment Variables

Configure these on the Render web service:

| Key | Value | Notes |
| --- | --- | --- |
| `RAILS_ENV` | `production` | Explicit production runtime. |
| `RACK_ENV` | `production` | Keeps Rack/Rails aligned. |
| `DATABASE_URL` | internal Render Postgres URL | Use the internal URL from the Render database. |
| `SECRET_KEY_BASE` | generated secret | Generate with `bin/rails secret`; do not commit it. |
| `RAILS_MASTER_KEY` | local master key | Copy from `config/master.key`; do not commit it. |
| `RAILS_SERVE_STATIC_FILES` | `true` | Lets Rails serve precompiled assets on Render. |
| `RAILS_LOG_TO_STDOUT` | `true` | Sends logs to Render's log stream. |
| `RAILS_MAX_THREADS` | `5` | Matches the current Puma/default DB pool setting. |
| `WEB_CONCURRENCY` | `2` | Allows two Puma workers for better request handling on the Render instance. |
| `ACTIVE_STORAGE_SERVICE` | `amazon` | Uses S3 for runtime media. |
| `AWS_ACCESS_KEY_ID` | S3 access key | Store only in Render. |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key | Store only in Render. |
| `S3_REGION` | selected S3 region | Must match the bucket. |
| `S3_BUCKET_NAME` | production media bucket | Do not use the legacy archive bucket. |
| `SMTP_ADDRESS` | `smtp.resend.com` | Resend SMTP hostname. |
| `SMTP_PORT` | `587` | Uses STARTTLS and defaults to port 587 when omitted. |
| `SMTP_USERNAME` | `resend` | Resend SMTP username. |
| `SMTP_PASSWORD` | Resend API key | Store only in Render. |
| `MAILER_FROM_ADDRESS` | verified sender name and address | Must use the domain verified in Resend, for example `PicMeS Accounts <accounts@example.com>`. |
| `APP_HOST` | `picture-me-scrolling.onrender.com` | Enter only the hostname, without `https://` or a trailing slash. |

Production boot now requires the host, sender, and SMTP connection variables so
that a deployment cannot silently use local or test email settings. `SMTP_PORT`
is the only optional mail variable because it has a valid production default.

Do not configure `FSP_DATABASE_PASSWORD` on Render unless intentionally using
the non-`DATABASE_URL` fallback path. Keep `config/master.key` out of git;
Render should store that value only as the `RAILS_MASTER_KEY` environment
variable.

## S3 Setup Notes

The production bucket should be private by default and scoped to the app's media
needs. Before launch, confirm:

- the bucket region matches `S3_REGION`
- the Render environment has only the required AWS credentials
- avatar uploads render in the dashboard and feed
- photo, audio, and video posts upload and render/play back
- old S3 archive files remain optional/manual recovery media

## Deployment Steps

1. Create the Render Postgres database.
2. Create the Render web service from the GitHub repo.
3. Set the build, pre-deploy, and start commands listed above.
4. Add the required environment variables.
5. Trigger the first manual deploy.
6. Watch the build logs for `npm ci`, `npm run build`, and asset precompile.
7. Confirm migrations run in the pre-deploy step.
8. Confirm Render can reach the `/up` health check path.
9. Open the `.onrender.com` URL and run the smoke checks below.
10. Enable auto deploy after the first successful manual deploy.
11. Add a custom domain only after the Render URL smoke pass is clean.

## Post-Deploy Smoke Checks

Run these against the Render URL:

- Sign up, log in, log out, and guest log in.
- Confirm dashboard feed loads newest-first and paginates with Load more posts.
- Follow and unfollow a recommended user; confirm the feed updates.
- Like and unlike a post; confirm counts and icon state update.
- Create text, quote, link, photo, audio, and video posts.
- Edit text, quote, link, and media captions/titles.
- Delete an authored post.
- Confirm uploaded avatars/media are served from Active Storage/S3 URLs.

## Demo Data Refresh

Use the production-safe demo seed task to create or update the demo account,
followed feed posts, and recommended-user posts without deleting existing data:

`RAILS_ENV=production bin/rails demo:seed`

## Deferred

- `render.yaml` can be added later if dashboard-managed services become hard to
  reproduce.
- External uptime monitoring and error reporting can be added later if Render logs and metrics are not enough for launch visibility.
- Web service or database plan upgrades should be driven by Render metrics after
  launch.
