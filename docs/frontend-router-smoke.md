# Frontend Router Smoke Checks

These checks verify the React Router v7 app shell preserves the auth and
dashboard access behavior documented in `docs/frontend-router-inventory.md`.

## Automated Checks

Completed in Phase 3 route smoke:

- `npm run build` passes with React Router v7.
- No active frontend code references removed v5 APIs:
  - `Switch`
  - `Redirect`
  - `withRouter`
  - `useHistory`
  - `Route` with `component={...}`
  - `Route` with `render={...}`

## Manual Browser Smoke Checklist

Run these checks after starting the Rails app locally.

Logged-out routes:

- Visit `#/`.
  - Expected: login form renders.
- Visit `#/signup`.
  - Expected: signup form renders.
- Visit `#/dashboard`.
  - Expected: redirects to `#/`.

Logged-in routes:

- Log in from `#/`.
  - Expected: redirects to `#/dashboard`.
- Refresh while on `#/dashboard`.
  - Expected: dashboard still renders.
- Visit `#/`.
  - Expected: redirects to `#/dashboard`.
- Visit `#/signup`.
  - Expected: redirects to `#/dashboard`.
- Log out from `#/dashboard`.
  - Expected: current user clears and auth flow is available again.

Auth form navigation:

- From `#/`, click the sign-up link.
  - Expected: URL changes to `#/signup` and signup submit text appears.
- From `#/signup`, click the log-in link.
  - Expected: URL changes to `#/` and login submit text appears.
- Use guest login.
  - Expected: guest credentials animate into the form and login redirects to
    `#/dashboard`.

## Notes

- The app intentionally continues to use `HashRouter`.
- Guard redirects use `<Navigate replace />` to avoid back-button loops when a
  user is redirected away from an inaccessible route.
- Submit-style auth links still use `<Link />` with click handlers. That UI
  semantic cleanup can be handled separately if desired, but it is not required
  for the React Router v7 migration.
