# Phase 11 Backend Closeout

Phase 11 moved the backend from modernization cleanup into production-readiness
and performance hardening. This closeout captures what is now in place, what was
verified, and what remains after the phase.

## Scope Covered

- Backend production-readiness inventory and follow-up planning.
- Feed query ownership moved out of shared controller helpers.
- Database-backed recommended-user selection and fallback behavior.
- Database uniqueness constraints for duplicate likes and follows.
- Feed response preloading and current-user relationship set cleanup.
- Production configuration and Render deployment documentation.
- Render-focused deployment setup with `DATABASE_URL`, build steps, S3 env vars,
  and post-deploy smoke guidance.
- `/up` health check for Rails boot and database reachability.
- Launch monitoring baseline using Render logs and metrics.

## Verification

Commands attempted during closeout:

```sh
DISABLE_SPRING=1 asdf exec bin/rails test \
  test/models/user_test.rb \
  test/models/post_test.rb \
  test/models/like_test.rb \
  test/models/follow_test.rb \
  test/controllers/api/posts_controller_test.rb \
  test/controllers/api/follows_controller_test.rb \
  test/controllers/api/likes_controller_test.rb \
  test/controllers/api/users_controller_test.rb \
  test/controllers/api/session_controller_test.rb \
  test/controllers/health_controller_test.rb

npm run build
```

Results:

- The focused Rails model/controller test command passed from the normal local
  terminal.
- `npm run build` passed.
- The Rails focused test command could not complete inside the Codex sandbox
  because local PostgreSQL socket access is blocked with `Operation not
  permitted` at `/tmp/.s.PGSQL.5432`.

## Production Readiness Status

Ready for the current Render launch path:

- Render deployment settings are documented in `docs/render-production-setup.md`.
- Production config and secret expectations are documented in
  `docs/backend-production-readiness.md`.
- Active Storage uses S3 env vars in production.
- `/up` is documented as the Render health check path.
- Production smoke follow-ups are tracked in
  `docs/production-smoke-followups.md`.

## Known Warnings

- Rails test commands may emit known Rails 7.2 deprecation warnings around
  cache serialization and `Rails.application.secrets`.
- Local Ruby environments may emit native-extension warnings if ASDF, RVM, and
  system Ruby gem paths are mixed.
- Webpack currently reports stale `baseline-browser-mapping` data. The warning
  does not block the build.

## Remaining Follow-Ups

- Keep broader external error reporting, such as Sentry, Honeybadger, or
  Rollbar, deferred unless Render logs and metrics are not enough after launch.
- Continue tracking production smoke bugs in
  `docs/production-smoke-followups.md`.
- Add a production-safe demo seed task only if repeated production re-seeding is
  needed after the initial launch window.
- Continue future backend performance work as separate measured follow-ups
  after release traffic or Render metrics show a real need.
