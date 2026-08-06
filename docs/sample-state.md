# Sample Frontend Query Data

The frontend uses TanStack Query rather than a single Redux state tree. The
main query keys are `currentUser`, `posts`, `users`, and individual post/user
keys.

## Current User

```js
{
  id: 1,
  username: 'luffy',
  avatar_url: 'https://example.com/avatar.png',
  account_settings_enabled: true,
  email: 'luffy@example.com',
  email_verified_at: '2026-08-05T22:00:00Z'
}
```

Email fields appear only in the private current-user response. Public user
responses do not expose them.

## Paginated Posts

```js
{
  posts: {
    12: {
      id: 12,
      title: 'First Post',
      body: 'PicMeS to the world',
      post_type: 'text',
      url: null,
      author_id: 1,
      author: 'luffy',
      author_avatar: 'https://example.com/avatar.png',
      image_url: null,
      followed: true,
      liked: false,
      likes: 2
    }
  },
  post_ids: [12],
  pagination: {
    page: 1,
    per_page: 10,
    total_count: 1,
    total_pages: 1,
    has_more: false
  }
}
```

Mutations update or invalidate these query entries instead of dispatching
actions into a global client-state store.
