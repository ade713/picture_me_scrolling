# App-Wide Accessibility Audit

This pass follows the targeted icon-label and hover-state work with a broader
scan of active frontend routes and components. The goal is to capture remaining
a11y risks while landing only low-risk semantic improvements in this PR.

## Scope

Scanned:

- Logged-out auth and signup flows
- Dashboard shell and social links
- Feed list, feed items, follow/like/edit/delete actions, and load-more control
- Post creation modals for text, quote, link, photo, audio, and video
- Edit post modal
- Recommended users list

## Changes Made

- Added explicit accessible labels to auth username/password inputs instead of
  relying on placeholder text.
- Added autocomplete hints for auth username and password fields.
- Added explicit accessible labels to post form textareas and media file inputs.
- Added alert/live-region semantics to post form error output.
- Added explicit button types to modal footer buttons so they remain action
  controls when nested in or near form markup.

## Current Status

- Icon-only feed actions have accessible names and hover/focus affordances.
- Recommended-user follow controls have accessible names.
- GitHub and LinkedIn social links have accessible names and native titles.
- React Modal is configured with the app root in production entry code and test
  helpers.
- Delete confirmation has dialog semantics and labeled confirm/cancel actions.

## Remaining Follow-Ups

- Review custom delete-confirmation focus management: focus should move into the
  dialog, Escape should close if supported, and focus should return to the
  delete button after cancellation/confirmation.
- Consider adding an automated axe/Vitest accessibility smoke test once the
  dependency choice is made.
- Do a manual keyboard-only smoke pass in browser for auth, dashboard, create,
  edit, delete confirmation, follow, like, and load-more flows.
- Review heading levels on the auth marketing copy; multiple visual `h1`
  elements may be noisy for screen-reader navigation.

## Verification

- Frontend tests should be run after this pass with `npm run test:frontend`.
- Build should be run with `npm run build` before merge if this PR includes
  frontend code changes.
