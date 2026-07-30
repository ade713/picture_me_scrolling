# Forgotten Password and Account Recovery Plan

Status: implementation in progress. Email identity, verification-token
lifecycle, and email-delivery work are complete.

This document records the proposed forgotten-password flow, the decisions
already agreed upon, and the remaining product and infrastructure choices.
Implementation should remain separate from the authenticated password form on
the settings page.

## Goal

Allow a user who cannot provide their current password to securely choose a new
password through a verified email address.

The recovery flow should:

- avoid revealing whether an email address belongs to an account
- use short-lived, single-use reset links
- store only token digests
- preserve the existing password rules
- invalidate existing login sessions after a successful recovery reset
- keep email delivery and maintenance infrastructure intentionally small

## Current Application State

- Users currently have a username, password digest, and one session token.
- Users do not currently have an email address.
- Signup currently accepts only a username and password.
- The authenticated settings page changes a password only after confirming the
  current password.
- Action Mailer is installed through Rails, but production delivery is not
  configured and the default sender is still a placeholder.
- The frontend uses hash routing.

## Email Identity

The proposed user fields are:

```text
email
email_verified_at
```

Email addresses should be normalized to lowercase and protected by a unique
database index. The shared guest account should not participate in email
verification or password recovery.

Only a verified email address may receive a password-reset link.

Existing accounts need a way to add and verify an email through Settings.
Email should be collected for new personal signups. Whether an unverified new
account may log in immediately remains an open product decision.

Changing an email address should:

- clear `email_verified_at`
- invalidate any existing email-verification token
- invalidate any existing password-reset token
- send a new verification message

## Email Verification

Email verification and password recovery should use separate token models or
services because they prove different things and have different expiration and
invalidation rules.

Verification tokens should:

- be generated with a cryptographically secure random value
- store only a SHA-256 digest
- expire after 24 hours
- be replaced when another verification email is requested
- be deleted after successful verification

The verification controller should support:

```text
POST  /api/email_verification
PATCH /api/email_verification
```

The authenticated `POST` action resends verification. The public `PATCH`
action accepts the raw token in a filtered request body and confirms ownership.

## Password Reset Token

### Agreed storage design

Use one `PasswordResetToken` row per user:

```text
password_reset_tokens
  user_id
  token_digest
  expires_at
  created_at
  updated_at
```

Database indexes should enforce:

- one token row per user
- unique token digests
- efficient expiration cleanup

The raw token must never be stored. A SHA-256 digest is sufficient because the
raw token is cryptographically random and has high entropy.

### Agreed lifecycle

- Tokens expire after 30 minutes.
- A new request updates or replaces the user's existing token row.
- A newer request invalidates the previous raw reset link.
- A successful password reset deletes the token immediately.
- Each new reset request opportunistically deletes all expired token rows.
- No cron service is required for the initial implementation.
- No background-job queue is required.

The table remains bounded to at most one token row per user. An idempotent
pruning task may still be added for manual maintenance, but a paid Render cron
service should be deferred unless deterministic scheduled cleanup becomes
useful later.

## Password Reset API

Use a singleton resource so the raw token does not appear in an API URL:

```text
POST  /api/password_reset
PATCH /api/password_reset
```

### Request reset

Request body:

```json
{
  "password_reset": {
    "email": "user@example.com"
  }
}
```

The response must not reveal whether the email exists, is verified, belongs to
the guest account, or successfully received a message.

Proposed response:

```text
202 Accepted
```

```json
{
  "message": "If that address belongs to a verified account, a reset link has been sent."
}
```

### Complete reset

Request body:

```json
{
  "password_reset": {
    "token": "raw-temporary-token",
    "password": "new-password",
    "password_confirmation": "new-password"
  }
}
```

Invalid, expired, superseded, or missing tokens should return `422
Unprocessable Entity`. Valid tokens should apply the existing password rules:

- minimum 6 characters
- maximum 64 characters
- authoritative 72-byte BCrypt safeguard
- matching confirmation

After a successful reset:

- save the new password
- rotate the user's session token
- invalidate existing sessions
- delete the password-reset token in the same transaction
- clear the requesting browser's Rails session
- return the user to login rather than signing them in automatically

## Controller Responsibilities

### `Api::UsersController`

- accept email during personal signup
- initiate verification after successful account creation
- allow account creation to succeed if delivery fails
- log only the user ID and delivery exception class

### `Api::AccountsController`

- add an authenticated email-update action
- retain the existing shared guest restriction
- clear verification when the email changes
- coordinate token replacement and verification delivery through a service

### `Api::EmailVerificationsController`

- resend verification for an authenticated user
- confirm a verification token through a public action
- keep token generation and confirmation logic in services

### `Api::PasswordResetsController`

- opportunistically prune expired reset tokens
- normalize and look up the requested email
- return the same response for every reset request
- send a reset email only for a verified, eligible account
- delegate issuing and consuming tokens to services
- avoid placing token, password, or session logic directly in the controller

### Existing session controller

No recovery-specific behavior should be added to
`Api::SessionsController`.

## Sensitive Parameter Filtering

Rails parameter filtering should cover:

```ruby
Rails.application.config.filter_parameters += [
  :password,
  :token,
  :email
]
```

Reset and verification tokens should be submitted in request bodies rather
than API paths. This keeps raw tokens out of normal Rails path logs.

## Frontend Routes and Pages

Proposed public routes:

```text
#/forgot-password
#/reset-password/:token
#/verify-email/:token
```

The authentication page should include a `Forgot password?` link.

The forgot-password page should:

- accept one email address
- disable submission while pending
- always show the same success message
- avoid displaying whether the address exists

The reset-password page should:

- accept a new password and confirmation
- reuse centralized password limits and guidance
- disable submission until required fields are present
- show accessible pending, success, and validation feedback
- handle expired, invalid, used, and superseded links
- navigate to login after success

Because the frontend uses hash routing, the raw token in the reset-page URL is
not included in the initial request to Rails. The frontend should submit it to
the API only in the filtered request body.

## Email Delivery

### Agreed scope

Email delivery should remain a small dependency:

- use Action Mailer
- use SMTP
- use `deliver_now`
- send only verification and password-reset transactional messages
- keep HTML and plain-text templates in Rails
- configure credentials through Render environment variables
- do not add a background queue
- do not add inbound email
- do not add provider-hosted templates
- do not add marketing features, analytics, or a dedicated IP
- disable open and link tracking

Resend is the proposed provider because its SMTP support and expected volume
fit this portfolio application. Final provider selection and the production
sending domain remain open until implementation begins.

Proposed production variables:

```text
SMTP_ADDRESS
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
MAILER_FROM_ADDRESS
APP_HOST
```

`APP_HOST` should contain only the public hostname, such as
`picmes.example.com`; the production mailer adds the `https` protocol.

The sending domain must publish the SPF and DKIM records supplied by the email
provider. DMARC is recommended as an additional domain-protection policy.

### Agreed development workflow

Development email handling should avoid an additional gem or local SMTP
service:

- use Action Mailer previews to inspect HTML and plain-text templates
- use Action Mailer's `:file` delivery method to exercise the complete local
  verification and password-reset flows with real tokens
- use Action Mailer's `:test` delivery method in automated tests
- keep generated development messages in a gitignored temporary directory

Letter Opener and a local SMTP catcher such as Mailpit are intentionally
deferred. Either may be reconsidered if the application gains enough email
workflows to justify another dependency or development service.

## Agreed Email Verification Copy

The verification email should remain minimal and transactional:

- clearly identify that the user needs to verify their PicMeS email address
- include one prominent verification link
- state when the link expires and that it can only be used once
- tell the recipient to ignore the message if they did not create or update a
  PicMeS account
- contain no promotional copy, analytics, or unrelated content

The HTML and plain-text versions should use the same wording. The HTML version
should display the complete verification URL as a fallback to its verification
button.

## Agreed Password Reset Email

Subject:

```text
Reset your PicMeS password
```

Proposed sender:

```text
PicMeS Accounts <accounts@your-domain.com>
```

Plain-text copy:

```text
Reset your PicMeS password

We received a request to reset the password for your PicMeS account.

Reset your password:
RESET_URL

This link expires in 30 minutes and can only be used once.

If you did not request a password reset, you can ignore this email. Your
password has not been changed.

— PicMeS
```

The HTML version should use the same wording, include one prominent reset
button, and display the complete reset URL as a fallback.

## Suggested PR Sequence

### PR 1: Add User Email Identity

Implementation status: complete.

- add email and verification state to users
- normalize and validate email addresses
- update signup and current-user JSON
- add authenticated email management for existing accounts
- preserve legacy-account and shared-guest behavior

### Phase 2: Add Email Verification

#### Part 1: Add Verification Token Lifecycle

Implementation status: complete.

- add verification-token storage
- add digest generation, expiration, replacement, and consumption services
- add focused model and service coverage

#### Part 2: Configure Verification Email Delivery

Implementation status: complete.

- configure Action Mailer, SMTP, development file delivery, and previews
- add minimal HTML and plain-text verification emails
- add mailer tests without controller or frontend changes

#### Part 3: Add Verification API

Implementation status: complete on the feature branch and pending review.

- add verification and resend endpoints
- trigger initial verification after signup
- replace tokens when verification is resent
- handle synchronous delivery failures
- add focused controller coverage

#### Part 4: Add Verification UI

- add the verification route and confirmation page
- add Settings verification status and resend action
- add query hooks, pending states, feedback, and accessibility coverage
- update the smoke documentation relevant to this behavior

### Phase 3: Add Password Recovery API

#### Part 1: Add Reset Token Lifecycle

- add password-reset token storage
- add issuance, digest lookup, expiration, replacement, and pruning
- add concurrency safeguards and focused model and service coverage

#### Part 2: Add Reset Requests

- add the public reset-request endpoint and uniform `202 Accepted` response
- add per-email and per-IP rate limiting
- add the agreed password-reset email and preview
- handle synchronous delivery failures
- add request and mailer coverage

#### Part 3: Complete Password Resets

- add the reset-consumption endpoint
- apply password validation and atomically delete the consumed token
- rotate sessions and clear the requesting browser session
- cover invalid, expired, used, and superseded tokens

### Phase 4: Add Password Recovery Pages

#### Part 1: Add Forgot Password Page

- add the authentication-page link, route, form, and request mutation
- show uniform success feedback and pending states
- add behavior and accessibility coverage

#### Part 2: Add Reset Password Page

- add the reset route and token handling
- add the new-password and confirmation form
- handle invalid and expired links
- return to login after success
- add behavior and accessibility coverage

#### Optional Part 3: Polish Recovery UI

Open this part only if the first two UI PRs reveal enough independent work to
justify it.

- complete responsive and keyboard-only review
- refine focus and announcement behavior
- keep changes limited to discovered UI issues and their focused documentation

### Phase 5: Verify and Close Out Account Recovery

Keep this as one small PR when it contains only verification and documentation:

- run Rails and frontend suites and the production build
- verify production SMTP delivery, SPF, and DKIM
- confirm tokens and passwords are absent from logs
- complete final smoke and closeout documentation

If production email configuration requires meaningful code changes, split it
into:

1. `Verify and Close Out Account Recovery — Part 1: Add Production Email
   Configuration`
2. `Verify and Close Out Account Recovery — Part 2: Document Recovery
   Verification`

### PR Scope Guardrails

- keep each PR centered on one independently reviewable concern
- include tests and documentation with the behavior they cover
- reassess the split when a PR approaches 10–15 changed files or 400–500 net
  changed lines
- split before implementation when the scope requires separate backend,
  delivery, API, or frontend reviews
- keep the application working and independently testable after every part

## Remaining Decisions

- PR 1 currently preserves immediate login after signup for unverified users;
  confirm this behavior before the account-recovery phase is merged.
- Whether email is mandatory for all legacy users or only required before
  recovery can be enabled.
- Final transactional email provider.
- Production sending domain and sender address.
- The initial rate-limiting mechanism for reset requests.
- Whether successful password-reset endpoints return `204 No Content` or a
  small JSON success payload. Verification endpoints use a small JSON success
  payload.
