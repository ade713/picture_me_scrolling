# Comments Plan

Status: planned; implementation has not started.

Prerequisite: complete and ship the [Dedicated Post Page](./dedicated-post-page-plan.md).

## Goal and Agreed MVP

Add text-only comments and one level of replies to posts. Full reading and all
comment mutations live on the dedicated post page. Dashboard and profile feeds
show compact, read-only comment previews.

Comment likes are a follow-up after the MVP, not part of initial delivery.
Adding actions directly to feed previews is another separate follow-up.

## Model and Relationships

Add a Comment model and comments API controller; neither existed when this plan
was drafted. A post and a user can each have many comments. Each active comment
belongs to one post and one author. Do not add a unique user/post constraint:
the same user may comment on a post multiple times.

Planned columns:

| Column | Purpose |
| --- | --- |
| `id` | Comment identity. |
| `body` | Plain-text content; cleared for deleted placeholders. |
| `user_id` | Author; nullable for anonymous deleted placeholders. |
| `post_id` | Required post association. |
| `parent_id` | Nullable self-reference; null for top-level comments. |
| `deleted_at` | Distinguish a deleted placeholder from an active comment. |
| `created_at`, `updated_at` | Creation and update timestamps. |

Replies use the same table. A parent can have many replies; this is not a binary
tree. The MVP permits only top-level comments and their direct replies, not
replies nested beneath replies. Add appropriate foreign keys and collection
indexes; finalize exact indexes with the read queries. Active comments require
an author and body even though placeholder storage permits their removal.

## Validation and Permissions

- Plain text only, rendered without interpreting HTML.
- Reject blank and whitespace-only content; maximum 1,000 characters.
- Frontend guidance and validation mirror authoritative backend rules.
- Use named constants for limits and application messages.
- Derive the author from the authenticated session and the post from the request
  resource, not a client-supplied author.
- A reply's parent must belong to the same post, be top-level, and not be deleted.
- Updating a comment may change only its body, not author, post, or parent.
- Only its author may edit/delete a comment, including a reply. Post ownership
  alone does not grant moderation over other users' comments in this MVP.
- Signed-in users who can view a post may comment without following its author.
- Enforce permissions on the server, not merely by hiding controls.

## Deletion Lifecycle

- Delete a comment without replies outright.
- For a parent with replies, clear its original text and author association,
  retain a deletion marker, and display "Comment deleted". Do not keep the
  original body hidden in storage or expose the former author in serialization.
- Preserve other users' replies beneath that placeholder.
- Remove the placeholder when its final reply is deleted.
- Deleting a user removes their comment content; retain anonymous placeholders
  only where necessary to preserve other users' replies.
- Deleting a post removes the entire discussion, including placeholders.
- Disable new replies to deleted parents: hide Reply and reject server requests,
  including submissions from forms opened before deletion.
- Existing replies remain readable and editable/deletable by their authors.
  "View replies" and "Show older replies" remain available.

Use transactional lifecycle handling and appropriate database constraints.
Coordinate reply creation with parent deletion so concurrent requests cannot
leave replies attached to a removed parent or create replies after deletion.
Do not configure user deletion to cascade away other users' reply threads.

## Dedicated Post Page UI

Render comments beneath the post; do not introduce a discussion modal. Show an
avatar, linked username, body, timestamp, Reply action, and author-only controls
where applicable. Deleted placeholders omit identity and mutation controls.

Top-level comments display oldest-to-newest, loading newer pages as the reader
continues. Reuse the app's pagination/loading conventions and shared animated
dots. Provide empty, failure, pending, and accessible feedback states.

Forms retain typed content on failure and clear only on success. A successful
submission must make the new comment/reply visible even when its chronological
position is outside loaded pages. Implement this without duplicating cached
items or presenting unloaded gaps as a complete collection. Include this case
in query/UI tests rather than relying only on invalidation of the first page.

Use established edit/cancel and delete-confirmation patterns. Cover focus
restoration, keyboard operation, labels, character guidance, and mobile layout.

## Replies and Pagination

- Replies are collapsed initially. Do not fetch a preview for every parent.
- Clicking "View replies" fetches the latest three replies for that comment.
- Display those replies chronologically beneath the parent, slightly indented.
- "Show older replies" explicitly fetches three more and prepends them.
- Preserve the reader's visible position when older replies are prepended.
- Each parent has independent pagination/cache state.
- Paginate top-level comments and replies separately, never an arbitrary flattened
  tree that splits parents and children across pages.

Proposed collection endpoints:

```text
GET /api/posts/:post_id/comments
GET /api/comments/:comment_id/replies
```

The first returns only top-level comments; the second only the parent's direct
replies. Return pagination metadata and reply counts without embedding whole
threads. Finalize mutation routes and exact response shape during API design.

Use deterministic ordering with an ID tie-breaker. Ensure inserts/deletions
between requests do not produce duplicate or skipped older replies; select a
pagination strategy appropriate to these changing collections during query work.
Top-level page size remains an implementation choice using existing conventions;
the preview/reply sizes above are agreed product behavior.

## Feed Previews

Dashboard and profile posts show the latest three active top-level comments,
ordered oldest-to-newest within that preview. Do not include replies or use a
deleted placeholder as a content preview.

Previews are read-only: author links and "View all comments" navigate to profiles
or the dedicated post page. No create, reply, edit, or delete controls appear in
the preview during the MVP. Decide the no-comments navigation copy during UI
implementation; "Add a comment" linking to the post page was suggested, not yet
specifically selected.

Fetch bounded previews efficiently with post collections. Avoid per-post query
growth, fetching all comments and trimming in Ruby, or per-card frontend requests.

## State and Cache Ownership

TanStack Query owns comments, replies, pagination, request state, and mutations.
Follow existing query-key conventions with separate post-comment and per-parent
reply collections. Client form state does not need a second server-data store.

Successful mutations refresh relevant collections and metadata, including reply
counts, post-page data, and dashboard/profile previews where affected. Keep
invalidation scoped and test transitions across views. Optimistic updates are
not required for this MVP.

## Delivery Strategy

Use a shared comments feature branch. Small implementation branches/PRs target
that branch, not `main`; merge the finished feature into `main` only after
acceptance checks. Keep CI running on implementation PRs. Confirm the final
deployment/migration sequence before release.

All parts below are planned. These are reviewable scope boundaries, not mandatory
PR sizes. Split unexpectedly large parts before implementation; combine only
genuinely small related pieces. Continue logical commits and user review
checkpoints. Do not mix unrelated cleanup into feature PRs.

### Phase 1: Data Model

| PR | Scope |
| --- | --- |
| 1-1: Add Comment Storage | Migration, foreign keys/indexes, associations, storage tests, database documentation; include reply/deletion fields upfront. |
| 1-2: Add Comment Validation | Body limits, same-post parent, single-level replies, deleted-parent rejection, behavior tests. |
| 1-3: Add Comment Deletion Lifecycle | Placeholders, childless deletion, user/post deletion, last-reply cleanup, concurrency/lifecycle tests. |

### Phase 2: Top-Level Comments API

| PR | Scope |
| --- | --- |
| 2-1: Add Paginated Comment Reads | Query, deterministic ordering, serialization, author details, reply counts, focused controller/query tests. |
| 2-2: Add Comment Creation | Authenticated creation, parameters, validation responses, permission tests. |
| 2-3: Add Comment Editing and Deletion | Author-only mutations, lifecycle integration, deleted-comment handling, API documentation. |

### Phase 3: Comments on the Post Page

| PR | Scope |
| --- | --- |
| 3-1: Add Comment Query Integration | API functions, keys, pagination and mutation hooks, scoped invalidation. |
| 3-2: Display Comments | Lists/items, identity links, timestamps, placeholders, loading/empty/error states, pagination. |
| 3-3: Add Comment Form | Body input, character guidance, pending/validation behavior, draft retention, new-comment visibility. |
| 3-4: Add Edit and Delete Controls | Author controls, edit/cancel, confirmation, focus and interaction tests. |

### Phase 4: Replies

| PR | Scope |
| --- | --- |
| 4-1: Add Replies API | Paginated reads and creation using shared comment behavior, parent checks, deletion-race coverage. |
| 4-2: Display Replies on Demand | Expansion, three-reply pages, independent query state, chronological display, prepend-position preservation. |
| 4-3: Add Reply Interactions | Form, shared edit/delete controls, count updates, new-reply visibility, deleted-parent handling. |

Replies are included before the MVP ships.

### Phase 5: Feed Previews

| PR | Scope |
| --- | --- |
| 5-1: Add Bounded Comment Previews | Efficient post-response previews, query-growth coverage, API tests. |
| 5-2: Display Feed Comment Previews | Shared dashboard/profile preview UI and navigation into the dedicated post page. |

### Phase 6: Release Readiness

| PR | Scope |
| --- | --- |
| 6-1: Add Representative Seed Discussions | Multiple comment/reply pages, different authors, deleted-parent example; safe repeatable demo data. |
| 6-2: Complete Accessibility and Integration Checks | Keyboard/mobile smoke checks, permissions, cache refreshes, pagination/deletion scenarios, final documentation. |

Save relevant smoke screenshots in a temporary directory for selection into PR
UI sections. Record actual completed checks, not merely planned coverage.

## Follow-ups After MVP

### Comment Likes

1. Storage and authenticated API.
2. Like controls/counts, query integration, and tests.
3. Smoke checks and documentation.

Existing likes are post-specific. A dedicated CommentLike model is the suggested
smaller approach; do not assume a broad polymorphic-like refactor is necessary.
A user/comment uniqueness constraint is appropriate for one like per user.

### Actions in Feed Previews

Consider creation, reply, and own-comment controls directly in feed previews in
a separate follow-up. Keep them out of the initial preview scope.

Arbitrary-depth reply threads, rich text/media comments, and additional moderation
are not part of the agreed MVP.
