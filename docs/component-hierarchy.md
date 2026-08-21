# Component Hierarchy

## Application Routes

- `AuthForm`
  - signup, login, guest login, and forgotten-password entry point
- `Dashboard`
  - `AccountMenu`
  - `PostBar` and post-type forms
  - `Feed`
    - `FeedItem` and post-type bodies
  - `RecommendedUsers`
- `ProfilePage`
  - `ProfileHeader`
  - `ProfileNavigation`
  - `ProfilePosts`
    - `FeedItem` and post-type bodies
  - `ProfileFollowers`
    - `ProfileRelationshipUsers`
    - `ProfileUserCard`
  - `ProfileFollowing`
    - `ProfileRelationshipUsers`
    - `ProfileUserCard`
- `SettingsPage`
  - `AvatarSettingsForm`
  - `EmailSettingsForm`
  - `EmailVerificationStatus`
  - `PasswordSettingsForm`
- `EmailVerificationPage`
- `ForgotPasswordPage`
  - `PasswordRecoveryLayout`
- `ResetPasswordPage`
  - `PasswordRecoveryLayout`
  - `ResetPasswordForm`

Protected routes require an authenticated current-user query. Authentication
routes redirect authenticated users to the dashboard. Email verification and
reset-token consumption remain public because users reach them from email.

## Frontend Routes

Path                       | Component                  | Access
---------------------------|----------------------------|----------------
`/`                        | `AuthForm`                 | logged out
`/signup`                  | `AuthForm`                 | logged out
`/dashboard`               | `Dashboard`                | authenticated
`/users/:id`               | `ProfilePage`              | authenticated
`/settings`                | `SettingsPage`             | authenticated
`/verify-email/:token`     | `EmailVerificationPage`    | public
`/forgot-password`         | `ForgotPasswordPage`       | logged out
`/reset-password/:token`   | `ResetPasswordPage`        | public

The application uses `HashRouter`, so deployed URLs include `#/` before these
frontend paths.
