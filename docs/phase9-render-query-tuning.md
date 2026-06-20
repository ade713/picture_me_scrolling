# Phase 9 Render and Query Tuning

Phase 9-6 makes small, measured tuning changes after the feed pagination work.
The goal is to reduce avoidable dashboard work without adding broad
optimization patterns before the app needs them.

## Changes

- Added modest default TanStack Query timing:
  - `staleTime`: 30 seconds
  - `gcTime`: 10 minutes
- Memoized repeated feed rows with `React.memo`.
- Memoized feed item mapping so parent rerenders do not rebuild the row list
  unless the posts array changes.
- Memoized recommended-user rows and the follow handler so mutation state changes
  do not force every unchanged recommended-user row to rerender.

## Reason

The dashboard is the busiest screen in the app. It renders the post composer,
the paginated feed, repeated feed items, and recommended users. After Phase 9-5,
loading another feed page can rerender the feed parent while most existing rows
remain unchanged. Memoizing the repeated row components keeps that render work
localized.

The query timing keeps recently fetched dashboard data fresh long enough for
quick navigation/remounts without forcing an immediate refetch. Mutations still
update or invalidate the affected query caches, so follow, unfollow, create,
delete, like, and unlike behavior remains explicit.

## Deferred

- No virtualization yet. The current paginated feed is still small enough that
  virtualization would add more complexity than value.
- No viewport-aware media priority yet. The first-three-post heuristic remains
  in place from Phase 9-4/9-5.
- No backend query index changes in this PR. Backend performance indexing should
  be handled separately with database migration coverage.
