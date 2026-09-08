# Component Hierarchy

## Application Routes

`ProfilePage` and `PostPage` share `PageLayout`, which owns their brand/account-menu
header, configurable back link, and main content shell. Pages retain ownership
of queries, content, and navigation behavior; the layout does not inspect routes
or manage scroll restoration.

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
- `PostPage`
  - `AccountMenu`
  - shared `LoadingIndicator` and page error states
  - `FeedItem` and post-type bodies, including owner actions
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
`/posts/:postId`           | `PostPage`                 | authenticated
`/settings`                | `SettingsPage`             | authenticated
`/verify-email/:token`     | `EmailVerificationPage`    | public
`/forgot-password`         | `ForgotPasswordPage`       | logged out
`/reset-password/:token`   | `ResetPasswordPage`        | public

The application uses `HashRouter`, so deployed URLs include `#/` before these
frontend paths.

Dashboard/profile post titles and shared `PostDetailLink` entry points open the
dedicated post page. Link-post titles retain their external URL; "View post"
provides the internal destination. Detail pages reuse post rendering without
self-navigation links. TanStack Query owns detail and collection data; mutation
updates keep these caches consistent. Comments are a separate upcoming feature.
