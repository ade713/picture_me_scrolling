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
