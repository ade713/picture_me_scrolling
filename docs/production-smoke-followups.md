# Production Smoke Follow-Ups

Track bugs and rough edges found during the first Render production smoke pass.
Keep this list focused on remaining behavior that should be fixed before a
broader release.

## Confirmed Working

- Normal login works in production.
- Guest login works after production seed data was added.
- Create, edit, and delete post flows complete successfully.
- Like and unlike flows work.
- Follow and unfollow users work.
- Recommended users update after follow/unfollow actions.
- Feed updates after follow/unfollow actions.
- Automatic post pagination loads the next page near the end of the feed.
- Logout and session persistence after refresh work.
- Link post validation and rendering work in production.
- Video posts create and play through S3.
- Audio posts create and play through S3.
- Photo posts create and render through S3.
- `picturemescrolling.com` and `www.picturemescrolling.com` serve over valid
  TLS, with `www` redirecting to the canonical root domain.
- Verification and password-reset email deliver through Resend from
  `accounts.picturemescrolling.com`; SPF, DKIM, and DMARC pass.
- Email verification, verification resend, and password recovery work in
  production.
- Expired, superseded, and consumed reset links fail as expected.
- Successful password recovery invalidates existing authenticated sessions.
- Recovery request logs filter email addresses, passwords, and raw tokens.

## Open Bugs / Buggy Behavior

- None at this time.

## Resolved During Production Smoke

These issues were found during the first Render smoke pass and have since been
addressed:

- Recommended-user feed coverage now has lightweight seed posts for early
  recommended users.
- Duplicate post submissions are guarded during create and edit requests.
- Duplicate login errors are deduped, and stale auth errors clear when switching
  auth modes.
- Audio posts use tighter spacing around the native audio player and caption.
- New users without uploaded avatars render a default profile image.
- Authored post deletes require confirmation before the delete mutation runs.
- Icon-only actions have accessible labels, native title tooltips, and clearer
  hover/focus states.

## Release Documentation

Repeatable production checks are recorded in
`docs/render-production-setup.md` and `docs/frontend-smoke-checklist.md`.

## Current Production Seed Approach

Use the production-safe demo seed task when demo records need to be refreshed
without deleting existing production content:

```sh
RAILS_ENV=production bin/rails demo:seed
```

The full `RAILS_ENV=production bin/rails db:seed` task remains destructive and
should only be used before real production data needs to be preserved.
