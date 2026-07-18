# Profile and Settings Page Plan

## Status

Proposed. This document records the product and implementation decisions
discussed before development begins.

The forgotten-password flow is intentionally deferred. Its future scope is
recorded separately in `plan.md`.

## Goal

Give an authenticated user a protected settings page where they can:

- replace their avatar image
- change their password after confirming their current password

The feature should also replace the dashboard's standalone `Log Out` button
with an account menu that provides access to Settings and Log Out.

## Dashboard Account Menu

### Agreed design

- Replace the existing `Log Out` button with a button displaying the current
  user's username.
- Give the username button a white border so it is visibly interactive.
- Do not add a chevron or settings icon.
- When the menu is closed, use a transparent background with white text.
- When the menu is open, use a white background with black text.
- Align the dropdown to the right edge of the username button.
- Include two controls in the dropdown:
  - `Settings`, which navigates to the settings page
  - `Log Out`, which performs the existing logout mutation

### Component structure

Add a focused component:

```text
frontend/components/dashboard/account_menu.jsx
```

Use a conventional popup containing a native link and button rather than a
strict ARIA menu. Native controls preserve familiar browser keyboard behavior
and require less custom arrow-key management.

### Interaction and accessibility

- The trigger should expose `aria-expanded`, `aria-haspopup`, and
  `aria-controls`.
- Enter and Space should open the menu through native button behavior.
- Escape should close the menu and return focus to the username button.
- Clicking outside the menu should close it.
- Selecting Settings or Log Out should close it.
- Route changes should not leave the menu open.
- The button and menu items need visible `:focus-visible` styles.
- The dropdown must remain inside the viewport at mobile widths.

## Settings Page

### Route and navigation

- Add a protected `#/settings` route.
- Settings should be available only to authenticated users.
- Render the `PicMeS` brand as a React Router link to `/dashboard` rather than a
  heading with a click handler. The brand link should retain a visible hover and
  keyboard-focus state and use `PicMeS` as its accessible name.
- Include a separate, explicit `Back to dashboard` link within the page. The
  brand provides global navigation while the back link provides clear local
  navigation.
- Show the current username and avatar near the top of the page.

### Page structure

Use two independent forms:

1. Avatar settings
2. Password settings

Independent forms keep validation and submission state isolated. A password
error should not block an avatar change, and an avatar error should not clear
password fields.

Present the forms in one centered settings panel with a clear divider and
approximately 32 to 40 pixels of vertical separation. On smaller screens, the
panel should use nearly the full viewport width with comfortable padding and
full-width action buttons where useful.

Suggested frontend structure:

```text
frontend/components/settings/
  settings_page.jsx
  avatar_settings_form.jsx
  password_settings_form.jsx
  settings_page.test.jsx
```

## Avatar Settings

### Proposed behavior

- Display the current avatar.
- Allow the user to choose a replacement image.
- Show a local preview before upload. Create a temporary object URL from the
  selected `File` and use it as the preview image's `src`; do not upload or
  persist the preview URL itself.
- Submit the image as `FormData` to Active Storage.
- Replace the existing attachment after a successful update and purge the old
  blob from storage so unused avatar objects do not accumulate in S3.
- Return the normal current-user JSON payload, including the new `avatar_url`.
- Update the current-user query immediately after success.
- Invalidate post and recommended-user queries because their payloads also
  contain avatar URLs.
- Keep removal and reversion to the default avatar as a possible later
  enhancement.

### Proposed validation

- Require a file.
- Accept JPEG, PNG, WebP, and GIF raster images.
- Reject SVG uploads because SVG can contain executable content.
- Require equal image width and height in the first version. The frontend may
  reject a known non-square image early for faster feedback, but the server must
  remain the authoritative dimension check.
- Enforce a reasonable upload limit, proposed as 5 MB.
- Return validation errors without replacing the current avatar.

Centered square cropping of non-square uploads is a possible later enhancement.
That version could let the user position the image and store or render a square
crop using `object-fit: cover` or an image-processing variant. Do not silently
crop non-square files in the first version; explain the square-image requirement
before file selection and return a clear validation error when it is not met.

The exact server-side dimension-inspection library and validation flow will be
selected during implementation; detailed square-image handling is deferred for
now.

### Storage cleanup

`User#avatar` is a `has_one_attached` association. In Rails 7.1, replacing that
attachment destroys the old attachment record and the default
`dependent: :purge_later` behavior enqueues a purge of its blob. The purge
removes both the Active Storage blob record and its object from S3, provided the
blob is not attached elsewhere.

The app does not currently configure a durable production Active Job backend,
and this feature will not introduce one solely for avatar cleanup. The initial
implementation will explicitly purge the previous avatar synchronously after
the replacement has attached and saved successfully.

Use a dedicated avatar-update service to own this lifecycle. Configure the
avatar attachment so replacement does not also enqueue the default
`purge_later` callback, capture the previous blob, attach and confirm the new
avatar, and then call `purge` on the previous blob. Preserve equivalent cleanup
when a user is eventually destroyed by capturing the attached blob before
destruction and purging it after the user transaction commits.

Synchronous cleanup adds an S3 deletion to the request. If that deletion fails,
keep the new avatar as the successful account update, log the old blob ID and
cleanup failure, and leave periodic orphan cleanup as a future operational
safeguard. Do not expose storage details in the user-facing error output.

Never purge the existing avatar before the new attachment has been validated,
uploaded, and saved. If the new upload fails, the current avatar must remain
attached and available.

Tests should verify the cleanup outcome rather than only counting an S3 API
call:

- the previous Active Storage blob record no longer exists
- the previous object key no longer exists in the configured storage service
- the replacement avatar remains attached
- no `ActiveStorage::PurgeJob` was enqueued
- a failed replacement leaves the previous avatar record and object intact

S3 deletion is idempotent, so the important contract is complete cleanup with
no redundant queued purge rather than an exact network-call count.

## Password Settings

### Agreed behavior

Include these fields:

- Current password
- New password
- Confirm new password

Requirements:

- Require the current password before accepting a change.
- Require the new password to satisfy the existing minimum length of six
  characters.
- Require the new password and confirmation to match.
- Clear all password fields after a successful update.
- Never return or log current or new password values.
- Keep the user logged in after a successful password change.

Retaining the current session is an agreed product decision. The password
update should not rotate or clear the session token used by the request.

### Error status decision

- Return `401 Unauthorized` when the request does not have a valid authenticated
  session.
- Return `422 Unprocessable Entity` when an authenticated user supplies an
  incorrect current password or invalid new-password fields.

The incorrect current password is a form validation failure, not a missing
authentication session, so `422` is the agreed response.

## API Design

Use current-user endpoints rather than accepting a user ID:

```text
PATCH /api/account/avatar
PATCH /api/account/password
```

Both endpoints should require login. Current-user endpoints avoid exposing an
account ID that could be altered to target another user.

### Avatar response

On success, return the existing user JSON shape:

```json
{
  "id": 1,
  "username": "example",
  "avatar_url": "/rails/active_storage/..."
}
```

### Error response

Continue using the application's existing JSON error-array convention so the
frontend API client can display errors consistently.

## Guest Account Protection

The production guest account is shared demo infrastructure. Allowing visitors
to change its password could lock everyone else out, and allowing avatar
changes could let visitors modify the public demo appearance.

Agreed behavior:

- Reject guest password and avatar mutations on the server.
- Allow the shared guest account to open the settings page, but disable both
  forms and display a clear message explaining that settings are unavailable
  for the shared account and that a personal account is required to change an
  avatar or password.
- Keep one shared guest account and do not add a `demo_account` database column
  solely for this exception.
- Centralize shared-guest identification in one server-side model or policy
  method using the existing guest-account constant. Do not repeat username
  comparisons across controllers or components.
- Expose a capability such as `account_settings_enabled` in the current-user
  JSON instead of exposing the username-based rule. The frontend should depend
  on that capability when disabling the forms and showing the explanation.
- Continue enforcing the restriction on the server; the frontend capability is
  presentation state, not an authorization boundary.

If usernames become editable, more shared accounts are introduced, or accounts
need different restriction sets, revisit a durable `account_type` or equivalent
schema-backed policy at that time.

## Forgotten Password

Forgotten-password recovery is out of scope for this feature. The first version
of the settings page will require the authenticated user's current password.

Secure recovery requires verified account email addresses, short-lived and
single-use reset tokens, transactional email delivery, expiration and
invalidation rules, and rate limiting. That work is preserved as a separate
future plan in `plan.md`.

Do not add a nonfunctional `Forgot your password?` link to the first settings
page.

## Frontend Data Flow

- Add account API functions for the avatar and password endpoints.
- Add separate TanStack Query mutations for avatar and password changes.
- Disable each form's submit button while its mutation is pending, matching the
  app's existing duplicate-submission protection. The avatar and password forms
  should disable independently.
- For avatar preview:
  - create the preview with `URL.createObjectURL(selectedFile)`
  - display the object URL locally while retaining the original `File` for the
    eventual `FormData` submission
  - revoke the previous object URL when another file is selected
  - revoke the object URL when the form unmounts or the preview is cleared
  - after a successful upload, replace the preview with the permanent
    `avatar_url` returned by the API
- On avatar success:
  - replace `queryKeys.currentUser` with the returned user
  - invalidate the posts query
  - invalidate recommended-user queries
- On password success:
  - preserve the current-user query and session
  - clear sensitive form state
  - show an accessible success message
- Announce success and error feedback with appropriate live-region semantics.

## Test Plan

### Rails coverage

- both endpoints require login
- the endpoints always update the current user rather than accepting a user ID
- the correct current password allows a password change
- an incorrect current password returns `422`
- short and mismatched new passwords return `422`
- a failed update leaves the existing password valid
- a successful update makes the new password valid
- a valid avatar attaches and appears in returned user JSON
- replacing an avatar keeps one attachment
- replacing an avatar purges the previous blob record and stored object
- missing, oversized, and unsupported avatar files are rejected
- non-square avatar images are rejected without replacing the current avatar
- failed avatar validation preserves the existing avatar
- guest password and avatar changes are rejected

### Frontend coverage

- the dashboard account button displays the username
- the account menu opens and closes through keyboard and pointer input
- Escape closes the menu and returns focus to its trigger
- Settings navigation and Log Out retain their existing behavior
- the settings page is protected
- current username and avatar render
- selecting an avatar displays a local preview
- selecting a known non-square image displays the square-image validation error
- replacing or clearing a selected file revokes its temporary preview URL
- avatar submission uses `FormData`
- avatar success refreshes current-user and dependent query data
- avatar and password submits are disabled only while their respective mutation
  is pending
- password mismatch blocks submission
- backend password errors render accessibly
- password success clears all password fields
- guest restrictions are visible and cannot be bypassed through the UI
- the `PicMeS` brand and explicit back link both navigate to the dashboard

### Manual verification

- keyboard-only navigation through the account menu and both forms
- visible focus and open-state styling
- mobile, tablet, and desktop layout
- avatar preview, upload, replacement, and display throughout the dashboard
- password success and failure behavior
- guest-account restrictions

## Proposed PR Chunks

1. Account API and security rules:
   - add current-user account routes and controller actions
   - add password verification and avatar validation
   - protect the guest account
   - add Rails tests
2. Settings page and query integration:
   - add the protected route and page structure
   - add avatar and password forms
   - add preview, mutation, cache-update, and feedback behavior
   - add component tests and styles
3. Dashboard account menu:
   - replace the Log Out button with the username trigger
   - add Settings and Log Out controls
   - add dismissal, focus-return, responsive, and keyboard coverage
4. Accessibility and release verification:
   - complete keyboard and responsive smoke passes
   - run Rails and frontend suites and the production build
   - update release and production smoke documentation

The account API should land before the settings forms. The account menu can be
reviewed independently, but the Settings link should not ship without the
protected settings route.
