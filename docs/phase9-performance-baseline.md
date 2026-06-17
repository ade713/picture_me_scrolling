# Phase 9 Performance Baseline

Phase 9 should optimize performance intentionally. This baseline records the
current frontend bundle, feed loading shape, and performance risks before
making runtime changes.

## Build Baseline

Measured on the Phase 9-1 branch with Node from `.nvmrc`.

### Development Build

Command:

```sh
npm run build
```

Result:

- Webpack compiled successfully.
- `bundle.js`: 1.83 MiB reported by Webpack.
- `app/assets/javascripts/bundle.js`: 1,922,572 bytes.
- `app/assets/javascripts/bundle.js.map`: 2,176,149 bytes.
- gzipped `bundle.js`: 335,543 bytes.

Webpack module summary:

- `node_modules`: 1.64 MiB.
- `frontend`: 82.7 KiB.
- `frontend/components`: 58.6 KiB.
- `frontend/query`: 7.95 KiB.
- `frontend/util`: 15.5 KiB.

### Production-Mode Build Snapshot

Command:

```sh
NODE_ENV=production webpack --mode production --output-path /private/tmp/picmes-webpack-baseline --output-filename bundle.js
```

Result:

- Webpack compiled successfully with asset-size warnings.
- `bundle.js`: 1.12 MiB reported by Webpack.
- temp `bundle.js`: 1,177,049 bytes.
- temp `bundle.js.map`: 1,456,382 bytes.
- gzipped temp `bundle.js`: 227,970 bytes.

Largest reported production bundle areas:

- `react-dom`: 533 KiB.
- `react-modal`: 48.5 KiB.
- `react`: 18.2 KiB.
- `scheduler`: 10.1 KiB.

## Current Runtime Shape

### Route and Page Baseline

- The app uses `HashRouter`.
- Logged-out routes:
  - `/` renders `AuthForm`.
  - `/signup` renders `AuthForm`.
- Logged-in route:
  - `/dashboard` renders `Dashboard`.
- `AuthRoute` redirects logged-in users to `/dashboard`.
- `ProtectedRoute` redirects logged-out users to `/`.
- The dashboard is the primary performance-sensitive route because it mounts the
  post composer, feed, feed items, recommended users, and media elements.
- Browser timing was not automated in this baseline PR; the next useful timing
  pass should run after Phase 9-2 adds realistic seed data.

### Feed Loading

- `usePosts` fetches `/api/posts` through TanStack Query.
- The frontend converts the posts object into an array with
  `Object.values(posts)`.
- `Feed` maps the full array into `FeedItem` components.
- There is no pagination, infinite scroll, virtualized list, or page-size
  contract yet.

### Rails Posts Endpoint

- `Api::PostsController#index` returns:
  `current_user.posts + current_user.followed_posts`.
- The endpoint renders every returned post through the posts index Jbuilder
  view.
- The response shape is an object keyed by post id.

### Query Defaults

- TanStack Query defaults:
  - `refetchOnWindowFocus: false`
  - `retry: 1`
- Current user query uses `staleTime: Infinity` and `gcTime: Infinity`.
- Posts and users currently use default stale/cache behavior.

### Media Rendering

- Feed image posts render plain `<img>` elements.
- Feed video and audio posts render native media elements.
- Current media elements do not use lazy loading or preload hints.
- Active Storage URLs are emitted by Rails Jbuilder as `image_url` and
  `avatar_url`.

## Seed Data Baseline

Current seeds provide:

- 17 users, including the guest user.
- 14 posts across text, quote, link, photo, and video types.
- A small number of follow relationships for guest feed behavior.
- Remote S3-backed seed media.

This is useful for behavior smoke testing, but it is not enough data to make a
meaningful pagination or render-performance decision. Phase 9-2 should add a
larger, realistic development seed set before implementing feed loading
changes.

Phase 9-2 seed data notes live in `docs/phase9-seed-data.md`.

## Initial Performance Risks

- The app ships a single Rails-served Webpack bundle.
- Production bundle size exceeds Webpack's default asset-size warning
  threshold.
- Feed loading is all-at-once on both backend and frontend.
- Feed rendering maps every post into React components immediately.
- Media elements lack lazy-loading/preload optimization.
- Existing seed volume is too small to expose feed-scale issues.

## Recommended Next PRs

1. Add realistic development seed data for performance scenarios.
2. Re-run this baseline with a larger feed.
3. Decide whether feed pagination/infinite scroll is justified.
4. Audit bundle cleanup after seed and feed-volume behavior are measurable.
5. Review media loading once feed volume is realistic.
