# Comments Plan

Status: Phase 1-1 storage merged into `feature/comments` in PR #188.
Phase 1-2 validation merged into `feature/comments` in PR #189.
Phase 1-3 deletion lifecycle merged into `feature/comments` in PR #190.
Phase 1 is complete on the integration branch, not released to production.
Phase 2-1 paginated reads merged into `feature/comments` in PR #191.
Phase 2-2 top-level comment creation merged into `feature/comments` in PR #192.
Phase 2-3 author-only editing and deletion merged into `feature/comments` in PR #193.
Phase 2 is complete on the integration branch, not released to production.
Phase 3-1 frontend query integration merged into `feature/comments` in PR #194.
Phase 3-2 read-only comment display merged into `feature/comments` in PR #195.
Phase 3-3 comment creation merged into `feature/comments` in PR #196.
Phase 3-4 author edit/delete controls are integrated into `feature/comments`.
The newest-first ordering follow-up is integrated into `feature/comments`.
Comment URL auto-linking is implemented on `comments-url-auto-linking`, pending
review and merge.

Phase 2-1 verification: all 261 Rails tests passed before readability cleanup;
all 9 focused query/API tests (63 assertions) passed afterward.

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

Phase 2-2 adds authenticated `POST /api/posts/:post_id/comments`, accepting only
`comment[body]`. The URL determines the post and the session determines the author;
client identity, parent, and deletion attributes are ignored. Success returns
the serialized comment directly with `201 Created`, using the same fields as
list entries. Validation failures return a message array with `422`; unknown
posts return `404`, and unauthenticated requests return `401`. No follow is
required. Reply creation remains later work.

Phase 2-3 adds `PATCH /api/comments/:id` and `DELETE /api/comments/:id`.
Both look up active comments through the authenticated author's comments,
including existing replies. Missing, deleted, and non-owned targets return the
same JSON `404` response. Post ownership grants no additional permission.
PATCH permits body only, returns the serialized comment with its actual reply
count, and returns `422` on validation failure without changing saved content.
DELETE uses `CommentDeletion` and returns `204 No Content` for both hard deletion
and placeholder conversion. Clients must refresh affected collections/reply
counts after deletion, including possible last-reply placeholder removal.

Phase 1-2 adds active-author/body validation, the 1,000-character body limit,
and parent existence, same-post, single-level, self-reference, and deleted-parent
checks. Existing replies remain editable after their parent becomes a placeholder.
Bodies remain plain text; safe rendering belongs to the UI phase. These model
checks work alongside Phase 1-3 transactional concurrency protection and the
later API's author-derived parameters, permissions, and body-only updates.

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

Phase 1-3 implements `CommentDeletion` for user-facing comment removal. Future
API actions must call this service rather than directly destroying comment rows.
`User#destroy` removes authored comment content through the same service.
Direct SQL/user `delete` bypasses callbacks and remains restricted by foreign keys.
The post foreign key now cascades: the existing post `delete` path removes all
discussion rows without relying on callbacks. User and parent foreign keys do
not cascade through other authors' replies.

Comment saves and service deletions serialize on the post row. New comments also
lock their author first, matching user-deletion lock order. Saves revalidate
fresh parent state under the lock, and stale edits cannot restore deleted text.
User cleanup acquires discussion locks in post-ID order. This conservative
per-post locking favors correctness over simultaneous writes on the same post;
revisit only if discussion traffic warrants finer-grained locking.

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

Top-level comments display newest-to-oldest, loading older pages as the reader
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

Top-level comments use newest-first `(created_at, id)` cursor pagination.
Pass the returned opaque `next_cursor` as `after`; it is signed and
bound to the post, but does not require the anchor comment to still exist.
`per_page` follows the existing query defaults (20, bounded to 1–50).
Metadata is `per_page`, `has_more`, and `next_cursor`, without offset-page totals.
The response uses `comments` keyed by ID and ordered `comment_ids`; each comment
includes public author identity (or null for a placeholder), body, timestamps,
post/parent IDs, deletion state, and a batched `reply_count`. Replies are not
embedded. Authentication is required, following the post author is not.
The replies endpoint and its reverse-pagination contract remain Phase 4-1 work.

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

The integration branch is `feature/comments`. Implementation PRs target this
branch, and CI includes pull requests against it. Phase 1-1 added nullable
body/author storage for placeholders and restrictive foreign keys. Phase 1-3
adds lifecycle handling and post-only cascading deletion; comment API mutations
are implemented through Phase 2. Collection indexes
support post/parent filtering and timestamp/ID ordering; revisit them alongside
the actual read queries.

Remaining parts below are planned. These are reviewable scope boundaries, not mandatory
PR sizes. Split unexpectedly large parts before implementation; combine only
genuinely small related pieces. Continue logical commits and user review
checkpoints. Do not mix unrelated cleanup into feature PRs.

### Phase 1: Data Model

Complete: PRs #188, #189, and #190 are merged into `feature/comments`.

| PR | Scope |
| --- | --- |
| 1-1: Add Comment Storage | Migration, foreign keys/indexes, associations, storage tests, database documentation; include reply/deletion fields upfront. |
| 1-2: Add Comment Validation | Body limits, same-post parent, single-level replies, deleted-parent rejection, behavior tests. |
| 1-3: Add Comment Deletion Lifecycle | Placeholders, childless deletion, user/post deletion, last-reply cleanup, concurrency/lifecycle tests. |

### Phase 2: Top-Level Comments API

Complete: PRs #191, #192, and #193 are merged into `feature/comments`.
All 274 Rails tests passed before the
final test-assertion cleanup; all 8 mutation tests (46 assertions) passed afterward.
Reply reads/creation remain Phase 4 work.

| PR | Scope |
| --- | --- |
| 2-1: Add Paginated Comment Reads | Query, deterministic ordering, serialization, author details, reply counts, focused controller/query tests. |
| 2-2: Add Comment Creation | Authenticated creation, parameters, validation responses, permission tests. |
| 2-3: Add Comment Editing and Deletion | Author-only mutations, lifecycle integration, deleted-comment handling, API documentation. |

### Phase 3: Comments on the Post Page

Phase 3-2 displays comments below the loaded post. Active entries show linked
author identity, a square avatar, local date/time, plain-text body, and reply
counts. Placeholders omit author identity and original text. Comments reuse the
shared loading indicator and automatic pagination, with keyboard-operable manual
fallback/retry. Cached comments remain visible on subsequent request failures.
Creation, editing/deletion controls, and reply expansion are not included yet.
Responsive styling is implemented; a live browser/responsive smoke pass remains
to be performed before visual closeout.
All 247 frontend tests passed before the final test cleanup; all 18 focused
comment/post-page tests passed afterward. Production build and Rails stylesheet
compilation passed, with bundle-size and existing deprecation warnings.

Temporary local review data is available through `DemoCommentSeed.run` in
development: 23 top-level entries for three frontend pages, an empty discussion,
varied text and wrapping examples, singular/plural reply counts, and a deleted
placeholder. The helper is temporary and must be removed when Phase 6-1 adds
permanent comment support to the existing seed workflow. Loading/error states
require browser checks rather than seed records.

Phase 3-1 adds `usePostComments`, `useCreateComment`, `useUpdateComment`, and
`useDeleteComment`. Reads use the opaque next cursor with 10 comments per request
and keys normalized by post ID. Failed next-page requests preserve loaded pages.
Successful mutations invalidate that post's comment queries, its detail query,
and only cached post collections containing that post. Invalidation is awaited
so pending state includes active refetches. Failed mutations leave caches intact.

Creation exposes the returned object through the mutation result without
injecting it into partially loaded cursor pages. Phase 3-3 retains successful
submissions for separate display until they appear in loaded pages, deduplicates
them by ID, and handles multiple submissions; invalidation alone does not meet the
new-comment visibility requirement. Delete refetches rather than assuming the
row disappeared, because the server may retain a placeholder. Per-parent reply
queries and their mutation integration remain Phase 4 work.

Phase 3-3 adds a textarea with a visually hidden label and the placeholder
“Write your comment”. Its character counter turns red above the 1,000-character
limit. Blank/over-limit submission guards, pending controls, and the shared
loading indicator provide validation and submission feedback. Failed
requests retain the draft; success clears it, announces completion, and restores
focus to the textarea. Rails remains authoritative for validation.

The composer is fixed to the viewport bottom, aligned with the post column, with
a compact resizable textarea and bounded height. A measured spacer reserves its
height so it does not obscure the last comment, including when feedback appears.
New comments appear in a separate “Your new comments” section until loaded cursor pages contain
them. Local copies are then retired to prevent duplicates or resurrection after
deletion. Live browser/keyboard verification, including mobile keyboard behavior,
remains outstanding for this phase.

| PR | Scope |
| --- | --- |
| 3-1: Add Comment Query Integration | API functions, keys, pagination and mutation hooks, scoped invalidation. |
| 3-2: Display Comments | Lists/items, identity links, timestamps, placeholders, loading/empty/error states, pagination. |
| 3-3: Add Comment Form | Body input, character guidance, pending/validation behavior, draft retention, new-comment visibility. |
| 3-4: Add Edit and Delete Controls | Author controls, edit/cancel, confirmation, focus and interaction tests. |

Phase 3-4 uses right-aligned pencil and trash icons matching post controls, with
accessible labels and tooltips. It adds author-only inline editing with character-limit guidance, pending
guards, draft retention on failure, and cancel/save focus restoration. Deletion
uses the existing confirmation-dialog styling and focus trapping, initially
focuses the safe cancel action, and keeps failed requests retryable. Successful
deletion refetches authoritative comments (including deleted-parent placeholders)
and moves focus to the discussion heading. Locally displayed new submissions
also update or disappear after successful mutations. Rails still enforces all
permissions. Live browser/keyboard and responsive checks remain outstanding.

Phase 3-4 verification: all 262 frontend tests passed, along with the production
Webpack build, Rails stylesheet compilation, and whitespace checks. Existing
bundle-size and Rails/Sass deprecation warnings remain unchanged in scope.

### Follow-up After Phase 3-4: Newest-First Comment Ordering

Implemented after Phase 3: top-level comments display newest-first so the latest
comments appear near the top. Both ordering keys descend and subsequent pages
select older tuples. The cursor purpose is changed to reject incompatible
oldest-first cursors; existing open discussions need a refresh to restart paging.
New submissions normally appear in the refetched first page. The separate local
section remains a newest-first fallback if the refetch fails or does not include
them, and retires entries once loaded to prevent duplicates.

- Updated backend ordering and cursor comparisons together, keeping deterministic
  `(created_at, id)` ordering and loading older comments on subsequent pages.
- Reviewed new-comment visibility and deduplication with the newest-first first page.
- Updated query/API and frontend pagination tests, including equal timestamps and
  multiple pages, and reconciled the ordering documentation.
- Kept this scoped to top-level discussion comments; reply and feed-preview
  ordering remain unchanged unless separately agreed.

### Follow-up After Phase 3-4: Automatically Link Comment URLs

Implemented after Phase 3-4 and before Phase 4: shared `CommentBody` rendering
makes explicit HTTP/HTTPS URLs clickable while keeping stored content plain text.
Replies can reuse the renderer in Phase 4. Bare domains, email addresses, invalid
URLs, and other schemes remain text. No Markdown, raw HTML rendering, link
previews, backend URL fetching, or new dependencies were added.

Links open in a new tab with `rel="noopener noreferrer ugc"`. They are underlined,
have visible rounded keyboard focus, and inherit long-text wrapping. Sentence
punctuation and unmatched closing brackets stay outside links; balanced brackets
within URLs are preserved. All original text, including whitespace and literal
HTML, is retained through React text rendering.

Tests cover destinations, protocols, punctuation, plain-text preservation, and
keyboard focus/activation. Live browser and responsive checks remain pending.

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
