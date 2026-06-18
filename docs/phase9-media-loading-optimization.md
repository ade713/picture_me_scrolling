# Phase 9 Media Loading Optimization

Phase 9-4 adds low-risk browser-native media loading hints to repeated feed UI.
It keeps the existing Active Storage URL contract unchanged.

## Changes

- The first three feed items now treat images as priority media with
  `loading="eager"`, `decoding="sync"`, and `fetchPriority="high"`.
- Later feed photo posts use `loading="lazy"` and `decoding="async"`.
- Later feed author avatars use `loading="lazy"` and `decoding="async"`.
- Feed audio/video media now uses `preload="metadata"`.

## Why

The Phase 9 seed data increases dashboard feed volume. Without loading hints,
the browser can eagerly schedule many images and media files while rendering the
full feed. Native lazy loading lets the browser defer lower-priority images, and
async decoding reduces the chance that image decoding blocks rendering.

The `index < 3` priority rule is a practical first pass. It keeps likely
above-the-fold feed images eager without pretending that a flat number perfectly
matches every viewport height or post layout.

For audio and video posts, `preload="metadata"` keeps controls useful while
avoiding an eager full media download.

## Deferred Work

- Pagination or infinite scroll remains Phase 9-5.
- Viewport-aware priority loading remains deferred to Phase 9-5 or Phase 9-6
  feed/render tuning.
- Backend media URL shape remains unchanged.
- Upload form previews remain unchanged because they show user-selected local
  files rather than feed-scale remote media.
- The post composer's current-user avatar remains eager because it is part of
  the first visible dashboard controls.
- Recommended-user avatars remain default/eager because they are a small,
  usually visible sidebar list rather than long-feed media.
