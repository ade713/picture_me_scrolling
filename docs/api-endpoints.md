# API Endpoints

## HTML API
- `GET /` - loads React web app

### Users
- `POST /api/users` - create a personal account using `user[username]`,
  `user[email]`, and `user[password]`; successful signup initiates email
  verification without failing account creation when delivery is unavailable
- `GET /api/users`
- `GET /api/users/:id` - return public profile identity, exact follower and
  following counts, and whether the current user follows the profile; unknown
  IDs return JSON `404 Not Found`
- `GET /api/users/:user_id/posts` - return posts authored by the requested user
  with stable newest-first ordering and pagination; optionally filter that
  user's posts using `tag`, such as
  `GET /api/users/42/posts?tag=photography&page=1&per_page=20`
- `GET /api/users/:user_id/followers` - return the requested user's followers
  with stable newest-relationship-first ordering and pagination
- `GET /api/users/:user_id/following` - return users followed by the requested
  user with stable newest-relationship-first ordering and pagination

### Comments

- `GET /api/posts/:post_id/comments` — authenticated, top-level comments only,
  oldest first by `created_at` then `id`; following the author is not required.
- Optional `per_page` defaults to 20 and is bounded to 1–50, matching existing
  pagination normalization. Pass `pagination.next_cursor` as `after` for the next
  batch. The signed, post-bound cursor works even if its anchor is deleted.
- Returns `comments` keyed by ID, ordered `comment_ids`, and `pagination` with
  `per_page`, `has_more`, and `next_cursor` (null at the end). No page-number
  or total-count fields are returned for this cursor-based collection.
- Each comment contains `id`, `post_id`, `parent_id`, `created_at`, `updated_at`,
  `deleted`, `body`, `author`, and `reply_count`. Active authors expose only
  `id`, `username`, and `avatar_url`. Deleted placeholders return null for
  both author and body. Reply counts are batched; replies are not embedded.
- Empty results return an empty comments object and ID array. Returns `401`
  without a session, `404` for an unknown post, and `422` with
  `Comment cursor is invalid` for malformed or wrong-post cursors.
- `POST /api/posts/:post_id/comments` — create a top-level comment, accepting
  `comment[body]` only. Authentication is required; following the author is not.
  The post comes from the URL and the author from the session. Client-supplied
  identity, parent, and deletion attributes are ignored.
- Creation returns `201 Created` with the comment object directly (the same
  fields as a list entry, with `reply_count: 0`). Blank/whitespace-only bodies
  and bodies exceeding 1,000 characters return `422` with validation messages
  as an array. Unknown posts return `404`; unauthenticated requests return `401`.
  The `comment` parameter object is required by Rails strong parameters.
- Editing, deletion, and reply endpoints follow in later phases.

### Session
- `POST /api/session`
- `DELETE /api/session`

### Current Account
- `PATCH /api/account/avatar` - replace the authenticated user's avatar using
  multipart field `avatar`
- `PATCH /api/account/email` - replace the authenticated user's email using
  `account[email]`; changing the normalized address clears its verification
  timestamp and initiates verification without failing the update when
  delivery is unavailable
- `PATCH /api/account/password` - change the authenticated user's password using
  `account[current_password]`, `account[password]`, and
  `account[password_confirmation]`

All account endpoints return `401` when no authenticated session exists and
`422` for account-policy or validation errors. Successful responses use the
private current-user payload, including `email`, `email_verified_at`,
`avatar_url`, and `account_settings_enabled`. User index and show payloads do
not expose email fields or account-settings availability.

### Email Verification

- `POST /api/email_verification` - resend verification to the authenticated
  user's unverified email address
- `PATCH /api/email_verification` - publicly confirm an email using
  `email_verification[token]`

Successful resend returns `200 OK`:

```json
{
  "message": "Verification email sent"
}
```

Resend returns `401 Unauthorized` without a session, `422 Unprocessable
Entity` for an ineligible account, and `503 Service Unavailable` when
synchronous delivery fails.

Successful confirmation returns `200 OK`:

```json
{
  "message": "Email address verified"
}
```

Invalid, missing, used, or superseded tokens return `422 Unprocessable Entity`
with `Verification link is invalid`. Expired tokens return the same status with
`Verification link has expired`.

### Password Reset

- `POST /api/password_reset` - publicly request a password-reset link using
  `password_reset[email]`
- `PATCH /api/password_reset` - complete a reset using
  `password_reset[token]`, `password_reset[password]`, and
  `password_reset[password_confirmation]`

Every request returns `202 Accepted` with the same response, regardless of
whether the address exists, is verified, is eligible, is rate limited, or
successfully receives an email:

```json
{
  "message": "If that address belongs to a verified account, a reset link has been sent."
}
```

Only verified personal accounts receive email. Requests are limited to three
per normalized email and ten per IP address in each fixed one-hour window.

A successful reset returns `200 OK`, consumes the token, rotates the user's
session token, and clears the requesting browser session:

```json
{
  "message": "Password has been reset. Log in with your new password."
}
```

Invalid, missing, used, or superseded tokens return `422 Unprocessable Entity`
with `Password reset link is invalid`. Expired tokens return the same status
with `Password reset link has expired`. Password validation errors also return
`422 Unprocessable Entity` without consuming the valid token.

### Posts
- `GET /api/posts` - return the authenticated user's paginated followed-user
  feed; optionally filter accessible posts with a normalized `tag` query
  parameter, such as `GET /api/posts?tag=photography&page=1&per_page=20`
- `POST /api/posts` - create a post, optionally including up to five tag names
  using repeated `post[tags][]` fields for multipart requests or a `tags` array
  in JSON requests
- `GET /api/posts/:id` - return one post for an authenticated user, including
  author/media/tag and viewer like/follow details; following its author is not
  required. Unknown posts return `404` with `["Post not found"]`.
- `PATCH /api/posts/:id` - update an owned post and optionally replace its tags
- `PUT /api/posts/:id` - update an owned post and optionally replace its tags
- `DELETE /api/posts/:id`

Post payloads include `tags` as an alphabetized array of normalized tag names.
For example, a post payload contains:

```json
{
  "id": 42,
  "title": "Evening light",
  "tags": ["photography", "sunset"]
}
```

Tag names are trimmed, lowercased, and deduplicated. Omitting `tags` while
updating preserves the existing associations; sending an empty array removes
all tags. Invalid tags and requests containing more than five unique tags
return `422 Unprocessable Entity` without partially changing the post or its
tags.

Feed tag filtering is limited to the authenticated user's posts and posts from
followed users. Pagination metadata describes the filtered result. A valid tag
with no accessible matches returns `200 OK` with an empty paginated feed;
malformed or blank tag filters return `422 Unprocessable Entity` with `Tag
filter is invalid`.

User-post filtering applies only to posts authored by the requested profile
user and does not require the viewer to follow that user. Unknown users return
JSON `404 Not Found`. A valid tag without matches returns the same empty
paginated shape as the dashboard feed, while malformed or blank tag filters
return `422 Unprocessable Entity`.

### Follows
- `POST /api/users/:user_id/follow`
- `DELETE /api/users/:user_id/follow`

Followers and Following collection payloads contain a `users` object keyed by
user ID, an ordered `user_ids` array, and standard pagination metadata. Each
public user payload includes `followed_by_current_user` so relationship
controls can render without additional requests. The current user's own entry
always reports `false`. Unknown profile users return JSON `404 Not Found`.

### Likes
- `POST /api/posts/:post_id/like`
- `DELETE /api/posts/:post_id/like`
