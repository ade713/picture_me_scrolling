# Frontend Router Inventory

This inventory captures the router behavior that Phase 3 must preserve and the
current React Router v7 app shell after the dependency upgrade.

## Current Dependencies

- `react-router`: `^7.16.0`
- `react-router-dom`: `^7.16.0`

## Current Router Structure

The frontend uses `HashRouter` in `frontend/components/App.jsx`.

Current route table:

| Path | Wrapper | Component | Access behavior |
| --- | --- | --- | --- |
| `/` | `AuthRoute` | `AuthForm` | logged-out users can view login; logged-in users redirect to `/dashboard` |
| `/signup` | `AuthRoute` | `AuthForm` | logged-out users can view signup; logged-in users redirect to `/dashboard` |
| `/dashboard` | `ProtectedRoute` | `Dashboard` | logged-in users can view dashboard; logged-out users redirect to `/` |

Rails serves the React app from `root 'static_pages#root'`, and the client-side
router owns the hash routes after the root page loads.

## Current Router Files

Router entry:

- `frontend/components/App.jsx`
  - imports `HashRouter`, `Route`, and `Routes`
  - renders `AuthRoute` and `ProtectedRoute`
  - uses the modern `element={...}` route prop style

Route guards:

- `frontend/util/route_util.jsx`
  - imports `Navigate`
  - `AuthRoute` checks `useCurrentUser()`
  - `ProtectedRoute` checks `useCurrentUser()`
  - redirects with `<Navigate />`
  - renders guarded route children directly

Route-aware auth UI:

- `frontend/components/auth_form/auth_form.jsx`
  - imports `Link`, `useLocation`, and `useNavigate`
  - uses `useLocation()` to choose login vs signup mode
  - uses `useNavigate()` to send logged-in users to `/dashboard`
  - uses `<Link />` for auth-page navigation and submit-style actions

## Behavior To Preserve

Logged-out behavior:

- visiting `#/` shows the login form
- visiting `#/signup` shows the signup form
- visiting `#/dashboard` redirects to `#/`
- the login/signup nav link toggles between `#/` and `#/signup`

Logged-in behavior:

- visiting `#/` redirects to `#/dashboard`
- visiting `#/signup` redirects to `#/dashboard`
- visiting `#/dashboard` shows the dashboard
- refreshing while logged in keeps the user on the dashboard
- logging out clears the current user and returns the user to the auth flow

Auth form behavior:

- login submits credentials through the login mutation
- signup submits credentials through the signup mutation
- guest login fills credentials with the current animation and logs in
- auth errors still render under the form

## Completed Phase 3 Router Changes

React Router v5 APIs replaced:

- `Switch`
- `Redirect`
- `withRouter`
- `Route` with `component={...}`
- `Route` with `render={...}`
- `useHistory`

Current React Router v7 APIs:

- `Routes`
- `Navigate`
- `useNavigate`
- `Route` with `element={...}`
- guard components that render children or an outlet-style element

## Historical V5 Baseline

Before the Phase 3 router upgrade, the app used:

- `react-router`: `^5.3.4`
- `react-router-dom`: `^5.3.4`
- `Switch`
- `Redirect`
- `withRouter`
- `Route` with `component={...}`
- `Route` with `render={...}`
- `useHistory`

## Suggested Follow-Up Notes

- Keep `HashRouter` unless there is a specific reason to move to
  `BrowserRouter`.
- Preserve current auth redirect behavior before improving the UI semantics of
  submit links.
- Avoid mixing router modernization with Webpack/Vite changes.

## Smoke Checklist

Detailed smoke notes live in `docs/frontend-router-smoke.md`.

- logged-out root renders
- logged-out signup route renders
- logged-out dashboard route redirects to auth
- login redirects to dashboard
- guest login redirects to dashboard
- logged-in root redirects to dashboard
- logged-in signup redirects to dashboard
- refresh while logged in stays on dashboard
- logout returns to auth flow
