# Phase 9 Seed Data

Phase 9-2 expands development seed data so feed performance decisions are based
on realistic volume instead of the small curated demo set.

## Added Scenario Data

The seed file now adds:

- 24 generated performance users.
- 120 generated performance posts.
- 24 guest follow relationships for generated authors.
- 36 generated follow relationships between performance users.
- Deterministic likes across the generated performance posts.

Combined with the curated demo records, a fresh seed run should produce:

- 41 users.
- 134 posts.
- 62 follows.
- 840 likes across the generated feed data.

## Post Mix

The curated seeds continue to cover:

- text posts
- quote posts
- link posts
- photo posts
- video posts
- Active Storage media attachments

The generated performance posts focus on:

- text posts
- quote posts
- link posts

This keeps `db:seed` practical by avoiding repeated downloads of large remote
image and video files while still giving the dashboard feed enough volume to
evaluate render cost, pagination, or infinite-scroll needs.

## Guest Feed Behavior

The guest user follows all generated performance users. This makes the guest
dashboard feed large enough to expose all-at-once feed loading and rendering
costs.

Recommended users still have useful curated candidates because the guest does
not follow every original demo user.

## Follow-Up Use

Use this seed data before Phase 9 feed loading decisions:

1. Run a fresh local seed.
2. Login as the guest user.
3. Measure dashboard feed behavior with the larger post set.
4. Decide whether pagination, infinite scroll, or query tuning is justified.
