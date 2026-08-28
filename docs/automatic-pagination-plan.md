# Automatic Pagination Plan

Status: in progress. Part 1 is complete and Part 2 is in progress.

## Implementation Progress

Part 1 was completed in PR #175. The frontend now provides a reusable
IntersectionObserver trigger, a 10%-of-viewport preload boundary, duplicate
request protection, observer cleanup and reconnection, an accessible Load More
fallback, shared initial and next-page loading indicators, reduced-motion
styling, and focused infrastructure coverage.

Part 2 is in progress. Dashboard and profile post feeds now use the shared
trigger and loading presentation while retaining their existing tag filters,
empty states, initial errors, page sizes, and TanStack Query ownership.

## Goal

Replace ordinary Load More controls with automatic next-page loading across all
existing paginated frontend collections while preserving the current Rails API
contracts, TanStack Query cache ownership, accessibility, error recovery, and
browser navigation behavior.

The change applies to:

- dashboard posts
- profile posts
- profile Followers
- profile Following

The existing paginated endpoints and `useInfiniteQuery` hooks remain
authoritative. No database migration or backend pagination change is required.

## Trigger Behavior

Use `IntersectionObserver` rather than a window scroll listener. A sentinel is
rendered after each semantic post or user list and observed against the browser
viewport.

The next page is requested when the end sentinel comes within approximately
10% of the viewport height from the bottom of the screen. Because the sentinel
sits after the final rendered item, both conditions are naturally satisfied:

- the user is near the bottom of the viewport
- the user is near the end of the currently loaded collection

For example, if a page contains ten posts and only three fit in the viewport,
the sentinel remains below the other posts. It cannot trigger while the user is
still viewing the first three; it becomes observable only after the user has
scrolled through most of the page and reached approximately the final one or
two posts. Item-count calculations are intentionally avoided because text,
photo, audio, and video posts have significantly different rendered heights.

The preload distance should be calculated from the current viewport height
when the observer is created. Recreating the observer after a page request also
allows it to account for viewport-size changes without maintaining a continuous
scroll or resize listener.

The observer must:

- request only when another page exists
- refuse to request while a next-page request is already pending
- disconnect immediately before requesting a page to prevent duplicate calls
- reconnect after a successful request when another page remains
- disconnect permanently when the final page is reached
- disconnect during cleanup and whenever the active collection changes

If the initial results do not fill the viewport, the visible sentinel may load
additional pages one at a time until the viewport is filled or no page remains.

## Shared Frontend Ownership

Add a reusable automatic-pagination component or narrowly paired hook/component
that owns:

- the sentinel ref
- observer creation and cleanup
- the 10%-of-viewport preload distance
- duplicate-request protection
- initial and next-page loading presentation
- next-page error recovery
- compatibility fallback behavior

The consuming collection supplies only its TanStack Query state and action,
conceptually:

```jsx
<AutomaticPagination
  hasNextPage={query.hasNextPage}
  isFetchingNextPage={query.isFetchingNextPage}
  nextPageError={query.isFetchNextPageError}
  onLoadNextPage={query.fetchNextPage}
  loadingLabel="Loading more posts…"
/>
```

The sentinel and loading presentation remain outside the semantic `<ul>` so a
non-list element is never inserted among posts or user cards.

## Loading Presentation

Use one shared three-dot loading animation with two layout variants:

- initial loading: larger dots centered in the empty collection area
- next-page loading: smaller dots centered beneath the existing items

Do not display loading text alongside the dots. `Loading posts…`,
`Loading followers…`, or `Loading following…` remains available to assistive
technology through a visually hidden polite status region.

The dots animate sequentially from left to right and then right to left. Each
dot becomes slightly larger and less transparent at its active point while
remaining inside a fixed-size box so the surrounding layout does not move.

Suggested animation values:

- opacity from approximately `0.3` to `1`
- transform scale from approximately `0.75` to `1.15`
- approximately `1.1s` duration
- `ease-in-out` timing

Consider an approximately 150-millisecond visual appearance delay. Fast
requests can then finish before the loader appears, avoiding a brief flash. The
request and screen-reader announcement must not be delayed.

When `prefers-reduced-motion: reduce` is active, show the dots without animated
scale or opacity changes.

## Accessible Status Copy

Use different screen-reader messages for initial and pagination loading:

- `Loading posts…` and `Loading more posts…`
- `Loading followers…` and `Loading more followers…`
- `Loading following…` and `Loading more following…`

The visual dots are decorative and hidden from assistive technology. The
visually hidden loading copy supplies the polite live-region message. Appending
new records must not move keyboard focus or announce every newly rendered item.

No end-of-results message is required. When no page remains, remove the
sentinel and loader.

## Error and Compatibility Behavior

An initial request error retains each view's existing error behavior.

A next-page error must not replace or hide already loaded content. Instead:

- disconnect automatic observation
- keep the current items visible
- show a keyboard-accessible `Retry loading` text button beneath the list
- call the existing next-page request again when activated
- resume observation after a successful retry if another page remains

Use text rather than an icon-only retry action because its purpose is clearer
and it requires no tooltip discovery.

When `IntersectionObserver` is unavailable, render the existing accessible Load
More button for that collection. This fallback retains the current button copy,
pending state, focus treatment, and behavior.

## Collection and Navigation Changes

Changing a dashboard tag, profile tag, profile ID, or profile view represents a
new collection. The old observer must disconnect before the new collection is
observed. Existing query keys continue to reset pagination and prevent data
from different collections from mixing.

Appending a page naturally preserves the current scroll position because
existing items remain in place and new items are added after them.

Browser Back and Forward behavior must also preserve loaded query pages and the
user's previous scroll position when returning to a cached collection. First
verify the browser's native restoration after React has rendered the cached
pages. If that proves unreliable, add narrowly scoped restoration keyed by the
history entry rather than introducing broad application state.

Changing to a different tag, profile, or profile view intentionally retains the
existing focus-management behavior and moves to the new view or filter heading
instead of restoring the old collection's scroll position.

## Performance Boundaries

- Load only one page at a time.
- Continue using the existing page sizes and API pagination metadata.
- Do not prefetch multiple unseen pages concurrently.
- Do not introduce a window scroll handler, throttling, or debouncing.
- Do not introduce Zustand for observer or request state.
- Record list virtualization as a future option only if measured sessions load
  hundreds of posts or relationship cards and DOM growth becomes significant.

## Test Coverage

Shared automatic-pagination coverage should confirm:

- the sentinel is observed when another page exists
- entering the preload boundary calls the next-page action once
- a pending request cannot be duplicated
- the observer disconnects before loading and during cleanup
- observation resumes after a successful page load
- no observer is created after the final page
- an initially short list loads one page at a time
- next-page failures preserve existing content and expose Retry loading
- successful retry restores automatic observation
- the Load More fallback appears without `IntersectionObserver`
- initial and next-page variants expose their distinct accessible labels
- reduced-motion styling disables animation

Existing dashboard, profile-post, Followers, and Following component tests must
be updated to assert automatic behavior without weakening their loading, error,
empty, filter, pagination, or focus-management coverage.

Live smoke coverage should include:

- dashboard and profile-post pagination with and without tag filters
- Followers and Following pagination
- a viewport where the first API page exceeds the visible screen height
- a viewport where the first API page is too short to fill the screen
- next-page failure and retry
- browser fallback behavior
- Back and Forward scroll restoration with cached pages
- keyboard access to retry and fallback actions
- narrow and wide responsive layouts
- reduced-motion rendering

## Suggested PR Sequence

### Automatic Pagination Part 1: Add Shared Infrastructure — Complete

- add the observer-backed shared trigger
- add the initial and next-page loader variants using the selected animation
- add the selected appearance delay and reduced-motion behavior
- add observer, loader, and compatibility-fallback tests

### Automatic Pagination Part 2: Integrate Post Feeds

- integrate dashboard posts and profile posts
- preserve tag-filter behavior
- update post-feed loading and fallback coverage

### Automatic Pagination Part 3: Integrate Relationship Views and Close Out

- integrate the shared trigger with Followers and Following
- add next-page failure and Retry loading behavior across all collections
- verify native Back and Forward scroll restoration and add a narrow fallback
  only if required
- update smoke checklists and component documentation
- run full automated, production-build, keyboard, responsive, fallback, and
  live browser verification

## Deferred Work

- list virtualization without measured DOM or rendering problems
- speculative multi-page prefetching
- global scroll-position state
- changing backend page sizes or pagination contracts
- an end-of-results message without demonstrated user need

## Definition of Done

- all existing paginated frontend collections load subsequent pages
  automatically near the end of their rendered content
- the trigger occurs approximately 10% of the viewport height before the
  sentinel reaches the bottom edge
- only one next-page request can run at a time
- existing content remains visible during pagination and after pagination
  errors
- Retry loading and browser-compatibility fallback actions are keyboard
  accessible
- initial and next-page loading use the agreed dot variants and accessible copy
- reduced-motion users receive a static loading indicator
- appending pages and returning through browser history preserve position
- tag, profile, and view changes reset observation and retain existing focus
  behavior
- all automated, build, responsive, keyboard, compatibility, and live browser
  checks pass
