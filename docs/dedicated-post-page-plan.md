# Dedicated Post Page Plan

Status: implementation and phase 1-4 automated closeout complete; closeout PR #185
merged on 2026-09-08. Live coverage limitations are recorded below.

## Implementation Progress

Phase 1-4 consolidates the completed phase 1-3 browser/keyboard evidence rather
than repeating it. Regression tests now cover profile-origin deletion navigation
and failed-delete cache preservation. The shared component hierarchy and smoke
checklists document the delivered page. No additional production behavior or
visual changes are introduced in this phase.

Phase 1-4 verification: all 230 frontend tests passed across 32 files with two
workers; `git diff --check` passed. Prior production-build, stylesheet, and live
browser results remain recorded below. No fresh live pass was run during this
documentation/test-only phase. Live network-failure and profile-origin deletion
scenarios remain unexercised; page errors and profile deletion navigation have
automated coverage. Comments implementation has not started.

Phase 1-3 adds title links and a consistent "View post" link to shared feed
rendering. Link posts are the exception: their title retains the external URL,
and only "View post" opens the dedicated page. There is no additional "Open link"
action. Detail pages omit self-navigation links.
Entry links preserve the originating route and tag filter in navigation state;
Back to feed uses history, and direct entry falls back to the dashboard.
Successful deletion replaces the detail route with the originating feed (or
dashboard fallback), never navigating before deletion succeeds. Edit/delete
updates now cover all cached post collections, with deleted detail cache removal.
The page resets scroll on fresh entry and participates in shared history scroll
restoration. The phase 1-3 live smoke results are recorded below.

Phase 1-3 verification: all 228 frontend tests passed across 32 files. Production
Webpack build, Rails stylesheet compilation, and diff checks passed. Existing
bundle-size and Rails/Sass deprecation warnings remain.

Live in-app browser smoke pass (2026-09-08):

- Keyboard title/View post activation worked; link-post titles retained external
  destinations and detail pages omitted self-navigation links.
- Detail tab order reached brand, account menu, Back, author, relationship,
  tags, and like controls. Space toggled a like; its changed state appeared on
  the dashboard. The test like was reverted.
- Dashboard return restored its internal feed scroll to 724px. Filtered profile
  return preserved `?tag=demo_feed` and restored window scroll to 1295px.
  Browser Forward reopened the detail page.
- Edit Escape restored focus to Edit. Delete confirmation initially focused No,
  trapped Tab between No/Yes, and Escape restored focus to Delete.
- An approved disposable local post was created, edited, and deleted. Its edit
  appeared on detail/dashboard; successful deletion returned to the dashboard
  and removed its feed entry. Direct navigation to its deleted URL showed
  "Post not found" with a working dashboard fallback. Existing posts were not
  edited or deleted.
- Desktop and 390px mobile link-post layouts were checked; mobile had no
  horizontal overflow. Temporary viewport override was reset.
- Screenshots were saved outside the repo in
  `/private/tmp/picmes-post-smoke-GbKkbq` for PR selection.

These were browser-driven keyboard events, not a separate physical-keyboard
user check. Network-failure UI and deletion originating from a profile were not
exercised live in this pass; automated coverage remains separate.

Phase 1-2 adds the protected `#/posts/:postId` page with the existing FeedItem,
account menu, dashboard links, shared loading dots, and not-found/error states.
The page uses its own responsive stylesheet and retains semantic list markup for
FeedItem. Tags use the existing default dashboard tag-filter destination.
Feed entry links and action/navigation integration were subsequently added in
phase 1-3. No comments UI is included.

Phase 1-2 verification: all 224 frontend tests passed across 32 files with two
workers, including six new page tests. Production Webpack build, Rails stylesheet
compilation, and diff whitespace checks passed. Existing bundle-size and
Rails/Sass deprecation warnings remain. Subsequent live browser/keyboard results
are recorded under phase 1-3 above.

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
- Link posts are the exception: their title opens the external URL; only
  "View post" opens the dedicated page.
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

The post `show` route supplies the existing post rendering contract and JSON 404
for unknown IDs. Authenticated viewers do not need to follow the author.

TanStack Query owns the single-post request, cache, loading, and error state.
Reuse existing API, route, query-key, and label conventions. Like/edit/delete
mutations must keep detail and existing feed caches consistent. Avoid copying
post components or introducing unrelated abstractions.

Detail tags lead to dashboard tag filters. Direct entry provides a dashboard
fallback, while feed entry retains its origin and filter in navigation state.

## Delivery Structure

Phases 1-1 through 1-4 are implemented. Keep PRs focused
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

Shared page-layout extraction is implemented in the follow-up branch
`refactor-shared-page-layout` (not yet merged). PostPage and ProfilePage use
PageLayout for the brand/account-menu header, back link, main container, and
shared responsive styles. Post-specific history handling stays in PostPage;
profile-specific content and the existing header border remain unchanged.

HTTP status-code cleanup is implemented in `refactor-http-status-code-constants`
(not yet merged). The application-code scan found the profile page's inline 404
and the post page's local `HTTP_NOT_FOUND`. Both now import `HTTP_NOT_FOUND` from
`frontend/config/http_status.js`. `HTTP_NO_CONTENT` remains local to the API
client because it already has a descriptive name and only one consumer.
Rails symbolic statuses such as `:not_found` remain unchanged. Behavior tests
retain literal expected codes to independently verify the API contract. No
unused status constants were added, and non-HTTP numbers were left out of scope.

## Next Feature

After this page ships, implement the [Comments Plan](./comments-plan.md). Its feed
previews will link here via "View all comments". Comment likes and actions within
feed previews remain separate follow-ups after the comments MVP.
