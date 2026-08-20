# User Profile Page Plan

Status: in progress. Phase 1, Phase 2, Phase 3, Phase 4-1, and Phase 4-2 are
complete. Phase 4-3-1 implementation is complete; Phase 4-3-2 is next.

## Implementation Progress

Phase 1 was completed across PRs #154–#157. The backend now provides profile
identity and relationship counts, paginated profile posts with optional tag
filtering, and paginated Followers and Following collections. All collection
endpoints share pagination bounds and public relationship-user serialization.

Phase 2-1 was completed in PR #158. The frontend now provides the protected
profile route, identity query integration, initial responsive page shell, and
loading, not-found, generic error, and Back states.

Phase 2-2 was completed in PR #159. The frontend now provides the responsive
profile header, compact relationship counts with accessible exact values,
Settings for the current user's profile, Follow/Unfollow actions for other
profiles, and post/user query refreshes after relationship mutations.

Phase 2-3 was completed in PR #160. The frontend now provides URL-owned Posts,
Followers, and Following navigation, canonical view links, conflicting
parameter normalization, persistent profile identity across views, and direct
URL and browser-history coverage.

Phase 3-1 implementation is complete. The frontend now provides a paginated
profile Posts view using the user-post infinite query and existing `FeedItem`
presentation without the dashboard PostBar. It includes loading, error, empty,
and next-page states; preserves like and owner-only Edit/Delete behavior; and
keeps like results synchronized across dashboard and profile-post caches.

Phase 3-2 was split into two focused parts. Part 1 was completed in PR #162 and
added URL-owned profile tag state, canonical view/tag normalization,
profile-scoped post queries, and context-aware post-tag destinations. Part 2
was completed in PR #163 and added the shared accessible filter header, profile
loading/error/empty filtered states, clear-filter behavior, and focus
management when filters change.

Phase 4-1 was completed in PR #165. The frontend now provides a reusable
relationship user card with canonical avatar and username links, current-user
action suppression, Follow/Unfollow and pending behavior, keyboard focus
styles, long-username wrapping, and responsive layout. A shared relationship
button keeps the profile header and user cards aligned on labels, callbacks,
accessible descriptions, and disabled behavior, while card-specific styles
remain in their own component stylesheet.

Phase 4-2 was split into two focused parts. Part 1 was completed in PR #166 and
added the Followers endpoint configuration, API utility, query key, reusable
relationship pagination options, and `useUserFollowers` infinite query. Part 2
was completed in PR #167 and added the visible Followers view using the shared
relationship cards, with
loading, error, empty, pagination, focus-management, and per-user pending
states. Existing user-family invalidation refreshes the profile counts and
Followers collection after successful relationship mutations.

Phase 4-3 is split into two focused parts. Phase 4-3-1 implementation is
complete and adds the Following endpoint configuration, API utility, query
key, `useUserFollowing` infinite query, shared relationship-query ownership,
pagination coverage, and cross-list invalidation. Phase 4-3-2 will add the
visible Following view and consolidate shared relationship-list behavior and
styling now visible across both relationship views.

The next checkpoint is Phase 4-3-2: add the Following profile view and complete
the shared relationship UI cleanup.

## Goal

Add authenticated user profile pages that show a user's identity, social
relationship counts, authored posts, followers, and followed users. The page
should build on the existing user, post, follow, tag, and TanStack Query
behavior without introducing new profile fields or duplicating the dashboard.

## Agreed MVP Scope

The initial profile page includes:

- the existing username as the display name
- the existing avatar
- follower and following counts
- a Follow or Unfollow action when viewing another user
- a Settings action when viewing the current user's own profile
- persistent Posts, Followers, and Following navigation
- paginated posts authored by the profile user
- paginated follower and following lists
- user-scoped tag filtering on the Posts view
- existing like, edit, delete, media, and tag behavior on profile posts
- links to profiles from feed authors, recommended users, relationship lists,
  and the dashboard account menu

Post creation remains exclusive to the dashboard. Profile pages allow an owner
to edit or delete existing posts but do not include the post-creation toolbar.

## Visibility and Privacy Boundary

Profiles are available to authenticated users. A viewer does not need to follow
the profile user to see:

- username and avatar
- follower and following counts
- authored posts
- Followers and Following views
- profile-scoped tag results

This gives users enough information to decide whether to follow an account.
Viewing a profile does not add its posts to the viewer's dashboard; following
the user does.

Follow status is not treated as a privacy control. Private accounts would
require an explicit future visibility setting and backend authorization rules.

Profile payloads must not expose email, email-verification state, password or
session information, or other private account settings.

## URL Design

The profile user's Posts view is canonical and does not use `view=posts`:

```text
#/users/:id
```

Other supported URLs are:

```text
#/users/:id?tag=photography
#/users/:id?view=followers
#/users/:id?view=following
```

Rules:

- selecting another profile always opens `#/users/:newUserId`
- switching profiles resets the active view, tag, and pagination
- selecting Followers or Following removes any `tag` parameter
- returning to Posts removes `view` and returns to unfiltered posts
- selecting a profile-post tag stays on that profile and sets `tag`
- clearing a tag returns to `#/users/:id`
- Back, Forward, reload, and shared links restore the complete URL-owned state
- a non-Posts view takes priority if both `view` and `tag` are present; the URL
  is normalized by removing `tag`
- unsupported `view` values fall back to Posts and normalize the URL

React Router owns the profile ID, active view, and active tag. Zustand is not
introduced for this server-backed or URL-owned state.

## Page Layout

Desktop layout:

```text
PicMeS                                      Current User menu

← Back to dashboard

[ Avatar ]  Username
            18 followers · 7 following
            Follow / Unfollow / Settings

Posts        Followers        Following
------------------------------------------------
Active view content
```

Narrow layout:

```text
← Back to dashboard

       [ Avatar ]
        Username
18 followers · 7 following
   Follow / Unfollow / Settings

Posts     Followers     Following
---------------------------------
Active view content
```

The avatar remains square and uses centered `object-fit: cover` cropping. The
profile header and view navigation remain present while active-view content is
loading or showing an empty or error state.

The three views are navigation links styled as tabs, not an ARIA `tablist`.
They update the URL, work with ordinary link keyboard behavior, and set
`aria-current="page"` on the active link.

## Relationship Counts

No schema change or counter-cache column is required. Counts come from the
existing follows table:

```ruby
Follow.where(followee_id: user.id).count # followers
Follow.where(follower_id: user.id).count # following
```

Counts appear in the profile header, not in the navigation links. The API
returns exact integers. The frontend uses compact formatting when values become
large enough to threaten the layout:

```text
999 followers
1.2K followers
18K followers
1.4M followers
```

Use `Intl.NumberFormat` with compact notation. Preserve the exact formatted
integer in an accessible label and title, such as `1,247 followers`.

The profile user response does not include `post_count`. The paginated posts
response already owns `pagination.total_count`, so duplicating it would add
superfluous response data.

## Profile Actions

When viewing another user:

- show Follow when the current user does not follow them
- show Unfollow when the current user follows them
- disable the action while its mutation is pending

When viewing the current user's profile:

- do not show Follow or Unfollow
- show a Settings link

Unfollowing a user while viewing their profile does not hide that profile or
its posts. It updates the relationship control and follower count, and removes
the user's posts from the viewer's dashboard feed after cache invalidation.

## Profile Views

### Posts

The default view renders only posts authored by the profile user, newest first
with an ID tie-breaker. It reuses the existing post presentation and actions:

- any authenticated viewer may like or unlike a displayed post
- only the post owner sees Edit and Delete
- Rails remains authoritative for update and deletion ownership
- editing or deleting invalidates dashboard and profile-post query families
- a deletion that empties a tag result naturally displays `No posts found`

The dashboard PostBar is intentionally omitted.

### Followers

The Followers view shows users whose `Follow#followee_id` is the profile user.
Relationships are ordered newest first with ID as a stable tie-breaker.

### Following

The Following view shows users followed by the profile user. Relationships are
ordered newest first with ID as a stable tie-breaker.

Followers and Following share one user-card component:

```text
[Avatar] Username                              Follow
```

- avatar and username link to the listed user's canonical profile URL
- another user's card shows Follow or Unfollow
- the current user's own card shows no relationship action
- actions remain visible and usernames may wrap on narrow screens
- selecting a card's profile resets view and tag state

## Tag Filtering

Tags displayed on a profile post filter only that user's posts:

```text
#/users/42?tag=photography
```

The existing post-tag component should accept a route-building strategy or
destination context rather than duplicate tag rendering. Dashboard tags keep
their existing dashboard destination.

The filtered profile header shows:

```text
Posts tagged #photography
× Clear
```

`Clear tag filter` remains the accessible name. Clearing returns to the same
user's unfiltered Posts view.

## API Design

All endpoints require an authenticated session.

### Profile Identity

```http
GET /api/users/:id
```

Response additions:

```json
{
  "id": 42,
  "username": "CoffeeSpidey",
  "avatar_url": "...",
  "follower_count": 18,
  "following_count": 7,
  "followed_by_current_user": true
}
```

`followed_by_current_user` is false when viewing the current user. The response
does not include posts, relationship lists, `post_count`, or private account
fields.

### User Posts

```http
GET /api/users/:user_id/posts?page=1&per_page=20
GET /api/users/:user_id/posts?tag=photography&page=1&per_page=20
```

Use the existing post serialization and pagination response shape. Tag
validation and normalization match the dashboard feed. Unlike the dashboard
feed query, this endpoint scopes only to `author_id = :user_id`.

### Followers

```http
GET /api/users/:user_id/followers?page=1&per_page=20
```

### Following

```http
GET /api/users/:user_id/following?page=1&per_page=20
```

Relationship responses contain normalized user payloads, ordered user IDs, and
pagination metadata:

```json
{
  "users": {
    "17": {
      "id": 17,
      "username": "Ryu",
      "avatar_url": "...",
      "followed_by_current_user": true
    }
  },
  "user_ids": [17],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 1,
    "total_pages": 1,
    "has_more": false
  }
}
```

All three collection endpoints default to 20 records and enforce the existing
safe pagination bounds.

## Not Found and Error States

An unknown profile user returns a JSON `404 Not Found`. The frontend replaces
the profile page with:

```text
← Back to dashboard

User not found
```

Do not render the profile header, counts, or navigation for an unknown user.

A profile identity request failure replaces the page with:

```text
← Back to dashboard

Unable to load profile.
```

There is no manual retry button in the MVP. Users may refresh or navigate away,
and TanStack Query may complete its configured automatic retry behavior before
the final state appears.

View-specific failures preserve the loaded profile header and navigation and
show a centered `role="alert"` state below them:

```text
Unable to load posts.
Unable to load followers.
Unable to load following.
```

## Loading and Empty States

Before identity loads:

```text
← Back to dashboard

Loading profile…
```

After identity loads, the active view shows a centered `role="status"` state:

```text
Loading posts…
Loading followers…
Loading following…
```

Empty states are centered in the same bordered content container while the
profile header and navigation remain visible:

```text
No posts yet
No posts found
No followers yet
Not following anyone yet
```

`No posts found` applies only to an active tag filter and keeps `× Clear`
available.

Pagination actions are:

```text
Load more posts
Load more followers
Load more following
```

Their pending labels use the corresponding `Loading …` copy.

## TanStack Query Ownership

Suggested query-key families:

```js
recommendedUsers: ["users", "recommended"];
user: (id) => ["users", "detail", id];
userPosts: (id, tag) => ["users", id, "posts", { tag }];
userFollowers: (id) => ["users", id, "followers"];
userFollowing: (id) => ["users", id, "following"];
```

Exact key construction may omit an empty tag object, but every collection needs
a stable prefix for family invalidation.

After a successful follow or unfollow, invalidate and refetch:

- dashboard post-feed queries
- recommended users
- the target user's profile identity and Followers list
- the current user's Following list
- visible relationship user-list queries whose action state may have changed

This refreshes follower/following counts and relationship actions without a
manual page reload. The mutation does not need to return counts.

Post update and deletion invalidate:

- dashboard post-feed query families
- the author's profile-post query family
- affected dashboard and profile tag filters
- the individual post query when used

The MVP uses server-authoritative invalidation and refetching. Multi-cache
optimistic follow/unfollow updates and rollback behavior are deferred to a
focused follow-up PR after the profile feature is complete and verified.

## Accessibility

- use a real heading for the username/profile identity
- give profile navigation an accessible name
- use links with `aria-current="page"` for active navigation
- use descriptive Follow, Unfollow, Settings, and Back labels
- preserve exact relationship counts for assistive technology
- move focus to the active view heading after a URL-owned view or tag change
- announce loading with `role="status"` and errors with `role="alert"`
- preserve visible focus indicators on profile, tag, navigation, action, and
  pagination links/buttons
- maintain logical keyboard order from header through navigation and content

## Responsive Behavior

- stack and center the profile header at narrow widths
- keep counts together when possible and compact large values
- divide profile navigation across the available width without overflow
- allow usernames and user-card content to wrap
- keep Follow/Unfollow accessible without horizontal scrolling
- wrap profile-post tags using the existing responsive behavior
- verify loading, error, empty, filtered, and paginated states at narrow and
  wide viewports

## Data Model

No schema change is required. The feature uses existing users, posts, follows,
likes, tags, post_tags, and Active Storage associations.

Counter-cache columns are unnecessary for one profile request. Reconsider them
only if measured production query volume demonstrates a need.

## Seeds and Verification

Demo data should provide:

- a current-user profile with owned posts
- followed and unfollowed profiles with posts
- more than one page of posts for one profile
- more than one page of followers or following for a stable relationship-list
  pagination scenario
- at least one profile with 1,000 or more followers or followed users so compact
  relationship-count formatting and overflow behavior are visible
- profile posts with shared tags for filtered pagination
- at least one profile with no posts, no followers, or no followed users

Seed updates should intentionally represent distinct frontend states and display
thresholds instead of only providing enough records for backend behavior.
Defer these updates until Phase 5-2, after the functional profile work is
complete, so all representative profile states can be added and verified
together. Use PicMeS Guest as the primary portfolio showcase profile for the
1,000-or-more follower scenario.

Verification includes:

- complete Rails and frontend suites
- production frontend build
- authenticated access and unknown-user JSON 404 behavior
- own and other-user profile behavior
- posts, Followers, and Following pagination
- follow/unfollow count and cache refresh behavior
- edit/delete ownership behavior on profile posts
- tag filtering, clearing, reload, Back, Forward, and profile switching
- keyboard-only and responsive live browser passes

## Implementation Sequence

Keep each PR independently reviewable. Reassess and split before a PR approaches
10–15 files or 400–500 net lines.

### Phase 1: Add Profile Data APIs — Complete

#### Phase 1-1: Add Profile Identity and Counts — Complete

Scope:

- add follower/following counts and current-viewer relationship state
- return JSON 404 for unknown users
- protect private account fields
- add controller/model/query tests and API documentation

#### Phase 1-2: Add Paginated User Posts — Complete

Scope:

- add the nested user-post route and query
- add pagination, stable ordering, post preloading, and serialization
- add optional user-scoped tag filtering
- cover missing users, invalid tags, empty results, and pagination

#### Phase 1-3: Add Paginated Followers — Complete

Scope:

- add the nested Followers endpoint
- return relationship-aware user cards and pagination
- order relationships newest first with a stable tie-breaker
- add query/controller tests and documentation

#### Phase 1-4: Add Paginated Following — Complete

Scope:

- add the nested Following endpoint
- reuse shared relationship pagination/serialization where readable
- add query/controller tests and documentation

### Phase 2: Build the Profile Page Foundation — Complete

#### Phase 2-1: Add Profile Route and Identity States — Complete

Scope:

- add `#/users/:id`
- add profile query integration and page shell
- add loading, error, not-found, and Back behavior
- add route and component tests

#### Phase 2-2: Add Profile Header and Actions — Complete

Scope:

- add avatar, username, compact counts, and accessible exact values
- add Follow/Unfollow for other users and Settings for self
- invalidate profile and relationship caches after successful mutations
- add responsive and accessibility coverage

#### Phase 2-3: Add URL-Owned Profile Navigation — Complete

Scope:

- add Posts, Followers, and Following links
- normalize unsupported or conflicting URL parameters
- preserve header/navigation across view states
- cover reload, Back, Forward, and direct URLs

### Phase 3: Add Profile Posts — Complete

#### Phase 3-1: Add Paginated Posts View — Complete

Scope:

- integrate the user-post infinite query
- reuse post rendering without the PostBar
- preserve likes and owner-only edit/delete behavior
- add loading, error, empty, and pagination states

#### Phase 3-2: Add Profile Tag Filtering — Complete

This checkpoint was divided into two reviewable PRs.

##### Phase 3-2-1: Add Profile Tag Routing — Complete

Scope:

- make post-tag destinations context-aware
- extract profile view/tag URL ownership and normalization into
  `useProfileNavigation`
- pass the normalized tag to profile-post queries
- preserve direct URL, reload, Back, Forward, and profile-switching behavior

##### Phase 3-2-2: Add Filtered Profile Post UI — Complete

Scope:

- extract and reuse the accessible tag-filter header
- add the profile-scoped filter heading and clear action
- hide the unfiltered Posts heading visually while retaining its focus target
- add filtered loading, error, empty, and pagination states
- move focus when the active tag changes or clears
- add component coverage for profile-scoped tag destinations and filter states

### Phase 4: Add Relationship Views

#### Phase 4-1: Build Shared Profile User Cards — Complete

Scope:

- add reusable linked avatar/username cards
- add self and other-user relationship actions
- add pending, wrapping, keyboard, and responsive behavior
- extract shared Follow/Unfollow behavior into a relationship button used by
  both the profile header and relationship user cards
- keep card-specific layout and responsive styles in a dedicated stylesheet

#### Phase 4-2: Add Followers View — Complete

This checkpoint was divided into two reviewable PRs.

##### Phase 4-2-1: Add Followers Query Integration — Complete

Scope:

- integrate the Followers infinite query
- add profile-specific query ownership and relationship pagination helpers
- verify page aggregation and mutation-driven cache invalidation

##### Phase 4-2-2: Add Followers Profile View — Complete

Scope:

- integrate shared relationship user cards into the Followers view
- add loading, error, empty, and pagination states
- refresh counts/lists after mutations
- move focus to the Followers heading when the view opens
- disable only the relationship action associated with the pending user

#### Phase 4-3: Add Following View

This checkpoint is divided into two reviewable PRs.

##### Phase 4-3-1: Add Following Query Integration — Complete

Scope:

- add the Following endpoint configuration, API utility, and query key
- add `useUserFollowing` using the shared relationship pagination behavior
- verify page aggregation and cache ownership
- verify successful Follow and Unfollow mutations invalidate both the
  Followers and Following collections

##### Phase 4-3-2: Add Following Profile View and Consolidate Relationship UI

Scope:

- integrate the Following infinite query into the visible profile view
- reuse shared relationship user cards and loading, error, empty, pagination,
  focus-management, and per-user pending behavior
- verify profile counts and both relationship views remain synchronized after
  mutations
- after both relationship views are visible, extract their shared list-state
  rendering where doing so removes actual duplication without obscuring the
  Followers and Following copy and empty-state differences
- move generic load-more action styles out of `_feed.scss` into an
  appropriately shared stylesheet so relationship pagination does not depend
  on feed-owned styling

### Phase 5: Add Entry Points and Close Out

#### Phase 5-1: Add Profile Navigation Entry Points

Scope:

- link feed author avatars and usernames
- link recommended-user avatars and usernames
- link relationship-list cards
- add Profile to the dashboard account menu

#### Phase 5-2: Verify and Document Profiles

Scope:

- update seeds at this closeout checkpoint, after all functional profile phases
  are complete
- add representative profile and relationship seeds
- include frontend-focused seed scenarios such as relationship counts above the
  1,000-count compact-formatting threshold, using PicMeS Guest as the primary
  portfolio example
- run full automated verification and production build
- complete keyboard-only, responsive, history, and pagination smoke passes
- update API, component, smoke-check, and closeout documentation
- record deferred work

## Deferred Work

- remove the `tagDestination` prop-drilling chain from `ProfilePosts` through
  `FeedItem` and `PostFooter` to `PostTags`; first evaluate a narrowly scoped
  React context or component composition, and use Zustand only if tag
  navigation becomes broader shared client state; scan the rest of the app for
  similar values passed through three or more component levels and address
  excessive prop drilling consistently where a clearer ownership boundary is
  available
- profile-based post creation
- multi-cache optimistic follow/unfollow updates and rollback
- bio, separate display name, website, location, or other profile fields
- private accounts and follow-request approval
- public logged-out profiles
- follower/following search or sorting controls
- manual retry buttons for transient profile/view failures
- relationship counter-cache columns without measured need
- consider renaming the existing `followers` and `followees` associations to
  clarify that they return `Follow` records rather than `User` records; defer
  this cross-cutting model refactor until it provides enough value on its own

## Definition of Done

- authenticated users can open their own and other users' profiles
- unknown users return JSON 404 and render `User not found`
- profile identity uses existing username/avatar and exact relationship counts
- large counts remain visually compact and accessibly exact
- Posts, Followers, and Following are URL-owned, paginated, and shareable
- switching profiles resets view, tag, and pagination state
- profile tags filter only the selected user's posts
- owner-only Edit/Delete and existing Like behavior work on profile posts
- follow/unfollow refreshes counts, lists, dashboard feed, and recommendations
- profile navigation is available from all agreed entry points
- loading, error, empty, filtered, and pagination states are accessible
- narrow and wide layouts do not overflow
- full Rails/frontend suites and production build pass
- live keyboard, responsive, reload, Back, and Forward smoke checks pass
