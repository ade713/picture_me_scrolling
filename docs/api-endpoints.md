# API Endpoints

## HTML API
- `GET /` - loads React web app

### Users
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`

### Session
- `POST /api/session`
- `DELETE /api/session`

### Current Account
- `PATCH /api/account/avatar` - replace the authenticated user's avatar using
  multipart field `avatar`
- `PATCH /api/account/password` - change the authenticated user's password using
  `account[current_password]`, `account[password]`, and
  `account[password_confirmation]`

Both account endpoints return `401` when no authenticated session exists and
`422` for account-policy or validation errors. Successful responses use the
standard user payload, including `avatar_url` and
`account_settings_enabled`.

### Posts
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PATCH /api/posts/:id`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

### Follows
- `POST /api/users/:user_id/follow`
- `DELETE /api/users/:user_id/follow`

### Likes
- `POST /api/posts/:post_id/like`
- `DELETE /api/posts/:post_id/like`
