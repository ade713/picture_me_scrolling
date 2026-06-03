# Frontend Router Inventory

This inventory captures the current React Router v5 behavior before Phase 3
router modernization work begins.

## Current Dependencies

- `react-router`: `^5.3.4`
- `react-router-dom`: `^5.3.4`

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
  - imports `HashRouter` and `Switch`
  - renders `AuthRoute` and `ProtectedRoute`
  - uses the v5 `component={...}` route prop style

Route guards:

- `frontend/util/route_util.jsx`
  - imports `Route`, `Redirect`, and `withRouter`
  - `AuthRoute` checks `useCurrentUser()`
  - `ProtectedRoute` checks `useCurrentUser()`
  - redirects with v5 `<Redirect />`
  - wraps both route guard components with `withRouter`

Route-aware auth UI:

- `frontend/components/auth_form/auth_form.jsx`
  - imports `Link`, `useHistory`, and `useLocation`
  - uses `useLocation()` to choose login vs signup mode
  - uses `useHistory()` to push logged-in users to `/dashboard`
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

## Known Phase 3 Migration Targets

React Router v5 APIs to replace:

- `Switch`
- `Redirect`
- `withRouter`
- `Route` with `component={...}`
- `Route` with `render={...}`
- `useHistory`

Likely React Router v6+ replacements:

- `Routes`
- `Navigate`
- `useNavigate`
- `Route` with `element={...}`
- guard components that render children or an outlet-style element

## Suggested Migration Notes

- Keep `HashRouter` for the first router upgrade unless there is a specific
  reason to move to `BrowserRouter`.
- Replace route guards before changing unrelated navigation behavior.
- Preserve current auth redirect behavior before improving the UI semantics of
  submit links.
- Avoid mixing router modernization with Webpack/Vite changes.

## Smoke Checklist

- logged-out root renders
- logged-out signup route renders
- logged-out dashboard route redirects to auth
- login redirects to dashboard
- guest login redirects to dashboard
- logged-in root redirects to dashboard
- logged-in signup redirects to dashboard
- refresh while logged in stays on dashboard
- logout returns to auth flow
