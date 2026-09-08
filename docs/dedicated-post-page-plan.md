# Dedicated Post Page Plan

Status: phases 1-1 and 1-2 implemented; phase 1-2 automated checks passed.

## Implementation Progress

Phase 1-2 adds the protected `#/posts/:postId` page with the existing FeedItem,
account menu, dashboard links, shared loading dots, and not-found/error states.
The page uses its own responsive stylesheet and retains semantic list markup for
FeedItem. Tags use the existing default dashboard tag-filter destination.
Feed entry links, deletion navigation, and cross-view action/scroll acceptance
checks remain in phase 1-3. No comments UI is included.

Phase 1-2 verification: all 224 frontend tests passed across 32 files with two
workers, including six new page tests. Production Webpack build, Rails stylesheet
compilation, and diff whitespace checks passed. Existing bundle-size and
Rails/Sass deprecation warnings remain. Live browser/keyboard checks have not
been performed for this page yet.

Phase 1-1 adds `usePost` using the existing detail endpoint and shared API client.
Detail query keys normalize IDs so route strings and numeric mutation IDs share
one cache. Missing IDs disable requests; API errors remain available to page
consumers. The existing authenticated show response supports unfollowed authors;
missing posts now return JSON 404 instead of attempting to render a nil post.
Focused hook/controller tests cover requests, cache isolation, and errors.

Verification: 11 post-hook tests and 29 post-controller tests (169 assertions)
passed. The full frontend suite did not complete locally: the default run
reported failures in form/tag tests, and a two-worker retry stalled.
Both runs were stopped. The later phase 1-2 full-suite run passed as recorded
above; the earlier stalls were not diagnosed by this work.

## Goal and Sequence

Provide an authenticated standalone page for an existing post before implementing
the [Comments MVP](./comments-plan.md). Ship this as its own feature; do not add
an empty comments section or comments infrastructure during this work.

## Agreed Scope

- Use `#/posts/:postId`.
- Reuse existing post presentation for all supported post types.
- Preserve likes, author-profile links, tags, and owner-only edit/delete controls.
- Add a clickable title wherever a title is displayed and a consistent
  "View post" link on every post in dashboard/profile feeds.
- Both entry points open the same post page. Do not make the entire card clickable
  or interfere with media and existing controls.
- Provide loading, not-found, and generic error states. Reuse the shared loading
  dots and established accessible page-state patterns.
- Preserve the originating feed's route/filter and scroll position when navigating
  back through history.
- After deleting the post, return to its originating dashboard/profile feed when
  available; otherwise return to the dashboard. A deleted detail page should not
  remain the active destination.
- Post creation stays on the dashboard.

The page is not a discussion-only route or a post-and-comments modal. Comments
will later render below the existing post, without replacing the page structure.

## Architecture and Implementation Checks

The API already registers a post `show` route. Confirm its response and access
rules meet the page's requirements before adding backend changes. Preserve the
existing authenticated visibility policy rather than requiring a follow.

TanStack Query owns the single-post request, cache, loading, and error state.
Reuse existing API, route, query-key, and label conventions. Like/edit/delete
mutations must keep detail and existing feed caches consistent. Avoid copying
post components or introducing unrelated abstractions.

During implementation, confirm detail-page tag destinations, direct-entry back
navigation, and post-response errors against existing route conventions. Keep
these decisions explicit in the relevant PR rather than silently inheriting
dashboard-only assumptions.

## Delivery Structure

Phases 1-1 and 1-2 are implemented; remaining parts are planned. Keep PRs focused
and use logical review checkpoints and commits. Split a part before implementation
if it becomes unexpectedly large.

| PR | Scope |
| --- | --- |
| 1-1: Add Post Query Integration | Confirm the existing API contract; add single-post API/query integration and request/error tests. |
| 1-2: Add Dedicated Post Page | Route, existing post rendering, loading/not-found/error states, and page navigation. |
| 1-3: Connect Post Navigation and Actions | Feed entry points, mutation/cache integration, deletion navigation, and history/scroll regression checks. |
| 1-4: Complete Post Page Validation | Keyboard/responsive smoke checks and documentation; make a separate PR only if changes are needed. |

## Acceptance Checks

- Open posts from dashboard and profile feeds, and by direct URL.
- Render every supported post type without changing its existing controls.
- Verify current-user ownership rules, likes, edits, and deletion.
- Verify loading, missing-post, and request-failure states.
- Verify browser Back/Forward and originating-feed scroll restoration.
- Verify keyboard focus, meaningful link names, and narrow-screen layout.
- Keep current implementation docs accurate as work lands; capture relevant UI
  screenshots in a temporary directory for selection into PR UI sections.

## Technical-Debt Follow-up

Consider extracting a shared page layout for the post and profile pages after
this focused PR. Both duplicate the brand/account-menu header, dashboard back
link, and associated styles. Consolidate those shared elements while preserving
page-specific content, layout, and navigation behavior. This refactor is deferred,
not part of phase 1-2.

After this feature, scan the app for inline numeric HTTP status codes and replace
them with descriptive named constants (for example, `HTTP_NOT_FOUND`). Review
existing local status constants for shared ownership where genuinely reused.
Keep Rails symbolic statuses such as `:not_found`; they already express intent.
Behavior tests may retain literal expected codes to independently verify the
API contract. This app-wide cleanup is outside the current page PR.

## Next Feature


After this page ships, implement the [Comments Plan](./comments-plan.md). Its feed
previews will link here via "View all comments". Comment likes and actions within
feed previews remain separate follow-ups after the comments MVP.
