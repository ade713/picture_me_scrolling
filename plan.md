# Frontend Modernization Plan

This plan documents the selected direction and completed rollout for
modernizing the Picture Me Scrolling frontend.

Status: complete.

The app started this track on React 19 while still carrying several frontend
patterns from the older Redux/class-component era. The goal was to modernize
the app in phases without combining too many high-risk changes at once.

## Chosen Direction

Use:

- React functional components and hooks
- TanStack Query for server/API state
- Zustand for client/UI state
- native `fetch` for API requests

Removed during this track:

- Redux
- React-Redux container patterns
- Redux Thunk
- Redux Logger
- jQuery-style AJAX usage
- class components

## Architecture

TanStack Query should own data that comes from the Rails API:

- current user/session data
- users
- posts
- likes
- follows
- loading and error state for API requests
- mutation state and query invalidation

Zustand should own client-only UI state:

- modal state
- composer/form UI state
- temporary draft UI state
- local view preferences
- UI-only notices that are not tied to a specific API request

Avoid using Zustand as a replacement Redux cache for server data. Server data
should live in TanStack Query.

## Phase 1: State and API Modernization

Status: complete.

Goal: replace the Redux/action/reducer/API-util pattern with hooks, TanStack
Query, Zustand, and fetch.

Planned work:

1. Add TanStack Query and Zustand.
2. Add a shared fetch API client with:
   - CSRF token handling
   - JSON request/response handling
   - FormData upload support
   - consistent error parsing
3. Add QueryClient setup at the app root.
4. Migrate auth/session first:
   - current user query
   - login mutation
   - logout mutation
5. Migrate posts/dashboard:
   - posts query
   - post detail query if needed
   - create post mutation
   - delete post mutation
6. Migrate users/profile data:
   - users query
   - user detail query
7. Migrate likes and follows:
   - like/unlike mutations
   - follow/unfollow mutations
   - query invalidation after mutations
8. Remove Redux once no active code depends on it:
   - actions
   - reducers
   - store
   - `connect` containers
   - Redux dependencies
9. Remove remaining jQuery usage from frontend API code.

Suggested first branch:

```text
frontend-query-zustand-migration
```

Suggested first chunk:

```text
Add TanStack Query, Zustand, and a fetch API client without removing Redux yet.
```

## Phase 2: Component Modernization

Status: complete.

Goal: convert the component layer to React hooks and remove legacy React
patterns.

Planned work:

1. Convert remaining class components to functional components.
2. Replace lifecycle methods with hooks where needed:
   - `useEffect`
   - `useMemo`
   - `useCallback`
   - `useRef`
3. Replace container components with direct hook usage.
4. Normalize form components:
   - auth form
   - photo form
   - audio form
   - video form
5. Keep Active Storage upload behavior intact:
   - use `FormData`
   - preserve the Rails parameter shape for media uploads
6. Clean up remaining React warnings.

Completed PR chunks:

1. Component inventory and low-risk cleanup:
   - document remaining class components
   - classify conversion risk
   - remove dead files and no-op constructors
   - avoid behavior rewrites
2. Shell and route components:
   - `App`
   - `Root`
   - `Dashboard`
   - `Feed`
   - `RecommendedUsers`
   - `RecUserItem`
3. Feed item component:
   - convert `FeedItem`
   - preserve post type rendering
   - preserve delete, like/unlike, and follow/unfollow behavior
4. Auth form component:
   - convert `AuthForm`
   - replace local form state with hooks
   - replace redirect lifecycle behavior with `useEffect`
   - preserve guest login behavior
5. Basic post forms:
   - `TextForm`
   - `QuoteForm`
   - `LinkForm`
   - normalize shared modal/input/error patterns where safe
6. Media post forms:
   - `PhotoForm`
   - `AudioForm`
   - `VideoForm`
   - preserve `FileReader`, `FormData`, and Rails upload parameter shape
7. Post bar and form container cleanup:
   - remove containers that no longer add value after forms are functional
   - move direct hook usage into components where appropriate
   - keep genuinely useful shared hooks
8. React warning cleanup and final smoke pass:
   - fix invalid DOM attributes, missing keys, and deprecated patterns
   - refactor repeated `FeedItem` rendering into smaller shared pieces such as
     post header, post footer, and post-type body components
   - run the full Phase 2 smoke checklist
9. Local component refactors:
   - extract shared post form controls
   - extract feed item post body and frame/header/footer pieces
   - keep refactors local and behavior-preserving
10. Container cleanup:
   - remove auth and recommended-users pass-through containers
   - remove dashboard, feed, and feed-item pass-through containers
   - move direct hook usage into the components that consume the data

Current component inventory:

| Component | Current shape | State/lifecycle | Phase 2 status |
| --- | --- | --- | --- |
| `Dashboard` | function | logout mutation hook | complete |
| `Feed` | function | posts query hook | complete |
| `RecommendedUsers` | function | users query and follow mutation hook | complete |
| `RecUserItem` | function | render-only | complete |
| `PostBar` | function | render-only | complete |
| `FeedItem` | function | current-user, post mutation, and follow mutation hooks | complete |
| `AuthForm` | function | local credentials, auth hooks, redirect effect | complete |
| `TextForm` | function | modal/input state hooks | complete |
| `QuoteForm` | function | modal/input state hooks | complete |
| `LinkForm` | function | modal/input state hooks | complete |
| `PhotoForm` | function | modal/input/file preview state hooks | complete |
| `AudioForm` | function | modal/input/file preview state hooks | complete |
| `VideoForm` | function | modal/input/file preview state hooks | complete |

Remaining Phase 2 notes:

- Active frontend code no longer has React class components.
- Old React-Redux-style container files have been removed.
- Hook ownership now lives in the components that consume the relevant data.
- CSS class names that include `container`, such as `new-post-container`, are
  styling vocabulary and can wait for the later CSS/design cleanup pass.

Manual smoke checks:

- logged-out root renders
- login works
- refresh while logged in works
- dashboard/feed loads
- avatars/images/videos render
- create media post works
- delete post works
- like/unlike works
- follow/unfollow works if still supported
- logout works

## Phase 3: App Shell and Tooling Modernization

Status: complete.

Goal: modernize routing and build tooling after the state/API and component
migrations are stable.

Planned work:

1. Upgrade React Router from v5 to a current version.
2. Replace old protected-route and redirect patterns.
3. Modernize navigation patterns.
4. Consider replacing the current Webpack/Babel setup with Vite.
5. Update build and deploy scripts if the tooling changes.
6. Remove obsolete compatibility code.
7. Update frontend documentation.

Starting context:

- Phase 1 and Phase 2 are complete.
- React Router has been upgraded to v7, and the app shell now uses modern route,
  redirect, and navigation APIs.
- Route behavior smoke notes live in `docs/frontend-router-smoke.md`.
- The Webpack/Babel vs Vite tooling decision is documented in
  `docs/frontend-build-tooling-inventory.md`.
- The current Webpack/Babel setup has been modernized while preserving the
  Rails-served bundle path.
- The long-term build tooling intention is to move JavaScript builds to Vite
  once the Rails asset boundary is cleaner.
- Frontend setup/build commands are now documented in `README.md`.

Recommended PR chunks:

1. Router inventory and prep:
   - audit current React Router v5 usage
   - document routes, redirects, protected-route behavior, and auth-route
     behavior
   - confirm logged-in and logged-out navigation behavior
   - avoid behavior changes unless a tiny cleanup is needed
   - router inventory lives in `docs/frontend-router-inventory.md`
2. Upgrade React Router dependency:
   - upgrade `react-router-dom` to the current version
   - update `package-lock.json`
   - make only the minimum code changes needed to compile if possible
   - status: complete
3. Replace route wrappers:
   - replace `AuthRoute` and `ProtectedRoute` v5 patterns
   - remove `withRouter`
   - use modern router APIs for redirects/navigation
   - preserve logged-in/logged-out access rules
   - status: complete
4. Modernize app shell routing:
   - update `App.jsx` to the modern router structure
   - replace `Switch` and old `component={...}` route patterns
   - confirm dashboard and auth routes still mount correctly
   - status: complete
5. Navigation and redirect cleanup:
   - replace old `useHistory` usage with modern navigation hooks
   - update auth redirect behavior in `AuthForm`
   - update any remaining route-driven navigation patterns
   - status: complete
6. Route behavior smoke:
   - scan for removed React Router v5 APIs
   - verify `npm run build` passes with React Router v7
   - document logged-in/logged-out route smoke checks
   - status: complete
7. Webpack/Babel tooling inventory:
   - audit the current Webpack/Babel setup
   - document what the Rails app expects from frontend build output
   - decide whether to keep Webpack or migrate to Vite
   - avoid major build changes in this chunk
   - build tooling inventory lives in `docs/frontend-build-tooling-inventory.md`
   - recommendation: modernize the current Webpack setup first, then revisit
     Vite as a dedicated asset integration project if needed
   - long-term intention: move JavaScript builds to Vite once the Rails asset
     boundary is cleaner
   - status: complete
8. Vite migration or Webpack modernization:
   - if moving to Vite, add Vite config, update frontend entry/build output,
     update scripts, and preserve Rails-served asset behavior
   - if staying on Webpack, clean stale Babel/Webpack config and update scripts
     and dependencies where useful
   - status: complete
9. Remove obsolete compatibility code:
   - remove router/tooling compatibility leftovers
   - remove unused packages
   - clean unused imports and files revealed by Phase 3
   - run the full smoke checklist
   - status: complete
10. Documentation and Phase 3 closeout:
   - update this plan
   - update README/frontend setup notes if needed
   - document current dev/build commands
   - mark Phase 3 complete
   - status: complete

Current frontend dev/build commands:

```text
nvm use
npm install
npm run build
npm run build:watch
```

`npm run build` emits the Rails-served bundle at
`app/assets/javascripts/bundle.js`. `npm run build:watch` keeps the bundle
updated during active frontend development.

## Phase 4: Behavior Hardening and Test Data

Status: complete.

Goal: make sure the modernized app behavior is correct, repeatable, and easier
to verify before continuing with deeper cleanup.

Focus areas:

- Fix stale UI behavior caused by missing or incorrect query invalidation.
- Verify follow/unfollow updates the dashboard feed without requiring a second
  action or full refresh.
- Confirm like/unlike, post create/delete, login/logout, and media rendering
  still update the UI predictably.
- Improve seed data so follow/feed scenarios are obvious and repeatable.
- Add focused smoke notes or tests for the behavior that was hard to verify
  manually during modernization.

Recommended PR chunks:

1. Follow/feed behavior audit:
   - reproduce the stale feed behavior
   - document the expected follow/unfollow feed behavior
   - inspect frontend query keys and invalidation paths
   - inspect the Rails feed endpoint behavior
   - audit notes live in `docs/follow-feed-behavior-audit.md`
   - status: complete
2. Follow/feed fix:
   - fix incorrect or missing query invalidation
   - update related TanStack Query hooks as needed
   - preserve current API response shapes unless a backend fix is necessary
   - status: complete
3. Seed data hardening:
   - add or adjust development seeds for users, follows, and posts
   - make feed behavior easy to verify with predictable accounts
   - avoid production data assumptions
   - status: complete
4. Behavior smoke/test coverage:
   - document or automate the key behavior checks
   - cover follow, unfollow, feed update, post create/delete, like/unlike, and
     media rendering
   - keep tests focused on modernization regression risk
   - smoke checklist lives in `docs/behavior-smoke-checks.md`
   - status: complete

Definition of done:

- Follow/unfollow changes are reflected in the feed without a full page refresh.
- Seed data supports repeatable local verification.
- The main dashboard/feed behavior can be verified from a clean local setup.
- `npm run build` passes.

## Phase 5: Dependency and Dead Code Cleanup

Status: complete.

Goal: remove or justify dependencies and files that are no longer needed after
the frontend modernization work.

Focus areas:

- Decide whether to keep or remove `zustand` based on actual client-only UI
  state needs.
- Scan for unused frontend files, imports, packages, and docs references.
- Review package vulnerabilities and dependency freshness.
- Confirm old compatibility dependencies are either removed or documented.
- Keep `coffee-rails` only while Sprockets still requires it.

Recommended PR chunks:

1. Dependency and dead-code inventory:
   - scan active imports and package usage
   - identify unused frontend files, packages, and stale docs references
   - document which findings are safe to remove and which need more context
   - avoid deleting code in this chunk unless the cleanup is tiny and obvious
   - inventory lives in `docs/dependency-dead-code-inventory.md`
   - status: complete
2. Frontend dependency cleanup:
   - decide whether `zustand` should stay installed or be removed for now
   - remove unused frontend packages found by the inventory
   - update `package.json` and `package-lock.json`
   - run `npm run build`
   - status: complete
3. Rails asset dependency cleanup:
   - re-check whether `coffee-rails` is still required by Sprockets
   - review Rails asset pipeline dependencies that remain from older versions
   - remove only dependencies proven unused by boot/build checks
   - document any dependency intentionally kept for Rails asset compatibility
   - status: complete
4. Dead file and stale docs cleanup:
   - remove unused frontend files, legacy generated files, and obsolete docs
     references found by the inventory
   - keep behavior changes out of this cleanup unless required by removal
   - update setup notes if dependency or command changes affect local dev
   - status: complete
5. Phase 5 verification and closeout:
   - run `npm run build`
   - run focused Rails checks affected by removed dependencies
   - confirm no obsolete dependency references remain
   - mark Phase 5 complete
   - closeout notes live in `docs/phase5-verification-closeout.md`
   - status: complete

## Phase 6: Backend Modernization

Status: complete.

Goal: continue modernization on the Rails/API side now that the frontend state,
component, router, and build layers are stable.

Focus areas:

- Review Rails 7 controller, routing, and rendering conventions.
- Verify the Active Storage migration path and production rollout assumptions.
- Confirm old Paperclip columns and compatibility code have been removed.
- Normalize API error handling and response shapes where useful.
- Check production-readiness configuration.

Recommended PR chunks:

1. Backend modernization inventory: done.
   - audit Rails routes, controllers, Jbuilder views, models, initializers, and
     production/development config
   - identify Rails 7 convention gaps and compatibility code that may still be
     needed
   - document backend cleanup candidates before changing behavior
2. Controller response and error handling cleanup: done.
   - normalize JSON error responses across sessions, users, posts, likes, and
     follows
   - replace unsafe bang/nil paths where user-facing API errors should be
     returned
   - preserve existing frontend response shapes unless the change is explicitly
     coordinated
3. Rails routing and API convention cleanup: done.
   - review singleton routes for sessions, likes, and follows
   - remove obsolete route/controller comments
   - keep route names stable for the current frontend API client
4. Active Storage and Paperclip cleanup plan: done.
   - verify current Active Storage attachment usage
   - confirm old Paperclip columns, configs, initializers, and rake wrappers
     were removed after the legacy S3 archive decision
   - document the legacy media recovery posture
5. Environment and production readiness cleanup: done.
   - review production asset settings, credentials/secrets usage, S3 config, and
     logging/cache deprecations
   - document or fix low-risk Rails 7.2 deprecation warnings
   - avoid deployment-provider-specific assumptions unless production hosting is
     chosen
6. Phase 6 verification and closeout: done.
   - run focused Rails tests affected by backend changes
   - run Rails boot/asset checks
   - update backend modernization docs and mark Phase 6 complete

## Phase 7: Test Coverage

Status: complete.

Goal: add focused automated coverage around the behavior most likely to regress
as the app continues to modernize.

Focus areas:

- API/request specs for sessions, users, posts, likes, and follows.
- Upload behavior coverage for Active Storage-backed media.
- Regression tests for login, dashboard feed loading, and post creation.
- Consider lightweight frontend smoke coverage if it adds confidence without
  adding too much test infrastructure.

Recommended PR chunks:

1. Test coverage inventory: done.
   - audit current Rails tests, fixtures, helper setup, and frontend smoke
     coverage
   - identify high-risk behavior gaps around auth, feed behavior, post
     creation, likes, follows, and Active Storage uploads
   - document the proposed test strategy before adding broader coverage
2. Auth and session API tests: done.
   - cover login, logout, signup, invalid credentials, and current-user
     behavior
   - confirm JSON response shapes and status codes used by the frontend
3. User and follow behavior tests: done.
   - cover users index/show behavior
   - cover follow/unfollow behavior, duplicate follow prevention, and missing
     follow handling
   - add focused fixture or seed-like test data where needed to protect feed
     update behavior
4. Posts feed and CRUD API tests: done.
   - cover posts index/show/create/delete behavior
   - confirm dashboard feed responses include the expected followed-user posts
   - preserve current API response shapes used by TanStack Query hooks
5. Likes API tests: done.
   - cover like/unlike behavior
   - cover duplicate likes, unliking missing likes, and response shapes used by
     optimistic cache updates
6. Active Storage upload tests: done.
   - cover image/avatar attachment behavior through the API paths that support
     uploads
   - confirm returned JSON includes Active Storage media URLs
   - confirm runtime behavior does not depend on legacy Paperclip columns
7. Frontend smoke test harness: done.
   - add a lightweight repeatable smoke script or documented browser smoke
     checklist
   - cover login, dashboard load, media rendering, follow/unfollow,
     like/unlike, and post creation
   - avoid heavy frontend test infrastructure unless it proves useful
8. Phase 7 verification and closeout: done.
   - run the relevant Rails test suite
   - run the frontend build
   - update docs and the plan with covered behavior and remaining intentional
     manual checks
   - mark Phase 7 complete

## Phase 7.5: Frontend Component Behavior Tests

Status: complete.

Goal: add a small component-focused frontend test layer to protect important
React behavior before more UI, CSS, and component cleanup work continues.

Focus areas:

- Keep tests component-focused rather than full app or browser automation.
- Test behavior that should carry through future refactors and modernization.
- Mock hooks/API boundaries where useful instead of testing TanStack Query
  internals.
- Keep the first pass small enough to avoid turning frontend testing into a
  large infrastructure project.

Recommended PR chunks:

1. Frontend component test setup:
   - add the smallest useful setup for component tests, likely Vitest, React
     Testing Library, user-event, and jsdom
   - add one npm script for frontend component tests
   - add a minimal test setup file for DOM helpers and shared mocks
   - include one tiny smoke test for a pure component such as `FormErrors` or
     `ModalButtonFooter`
2. Auth form behavior tests:
   - render login versus signup mode correctly
   - submit username/password through the mocked auth mutation
   - display auth errors
   - preserve guest login behavior with fake timers
3. Post form controls and text/link form tests:
   - cover shared `FormErrors` and `ModalButtonFooter` behavior
   - cover text form open/close behavior, required submit behavior, and payload
     shape
   - cover link form payload shape
   - follow up with quote form coverage in the same test area because it uses
     the same base non-media form pattern
4. Media post form tests:
   - cover photo, audio, and video modal open/close behavior
   - mock `FileReader` for upload preview behavior
   - confirm media submit is blocked without a file and submitted with a file
5. Feed item behavior tests:
   - render expected post-type body variants
   - show delete controls only for the current user's posts
   - call like/unlike, follow/unfollow, and delete handlers with expected ids
6. Recommended users behavior tests:
   - handle empty recommended-user lists gracefully
   - render recommended users with avatars and usernames
   - call follow mutation with the selected user id

## Phase 8: UI Structure, CSS Cleanup, and Accessibility

Status: complete.

Goal: clean styling, UI structure, and accessibility after the app behavior and
architecture are stable.

Focus areas:

- Inventory accessibility, CSS, and UI issues before making broad changes.
- Review CSS class names that no longer match the component structure.
- Remove unused CSS.
- Normalize feed, modal, form, and dashboard styling.
- Add accessible labels to feed item icon-only controls so like/delete tests can
  use role-based queries instead of CSS selectors.
- Improve responsive behavior.
- Check hover, focus, disabled, loading, error, empty, and destructive-action
  states.
- Keep visual cleanup separate from behavior fixes.

Recommended PR chunks:

1. UI, CSS, and accessibility inventory:
   - scan active frontend components and CSS files
   - document stale class names, unused CSS candidates, accessibility gaps,
     responsive weak spots, and high-noise style areas
   - treat accessibility as an inventory in this PR, not a full fix pass
   - sort follow-up fixes into later Phase 8 PRs
   - inventory lives in `docs/phase8-ui-css-accessibility-inventory.md`
2. Feed icon accessibility:
   - add accessible labels/names to icon-only feed controls such as like,
     unlike, and delete
   - update feed item action tests to use role-based queries instead of CSS
     selectors where possible
   - keep visual styling unchanged
3. Feed styling cleanup:
   - clean feed and feed item CSS class naming where it no longer matches the
     current component structure
   - remove obvious unused feed-related styles
   - normalize feed spacing, post frame/header/footer/body styling, and media
     sizing
4. Form and modal styling cleanup:
   - normalize post form modal layout, buttons, error display, and file upload
     presentation
   - clean stale form CSS
   - preserve existing form behavior, payloads, and tests
5. Auth and dashboard styling cleanup:
   - clean auth page, dashboard shell, post bar, and recommended users styles
   - remove stale class names left over from old container/component patterns
   - improve visual consistency without redesigning the app
6. Responsive pass:
   - check logged-out auth, dashboard/feed, post forms, media posts, and
     recommended users at mobile, tablet, and desktop widths
   - fix layout overflow, awkward spacing, modal sizing, feed width, and media
     sizing issues
   - add focused responsive smoke notes
7. CSS and UI closeout:
   - run final unused CSS scan
   - run frontend tests and build
   - do a final manual/browser smoke pass if useful
   - document any remaining design debt or larger redesign ideas for future work

Completed follow-up PRs:

- Moved React Modal styles from JavaScript inline style objects into SCSS.
- Refactored repeated post content/caption/link styles.
- Refactored duplicate auth submit and guest login button styles.
- Added shared SCSS breakpoint variables and media-query mixins.
- Added shared SCSS avatar sizing/frame mixins.
- Phase 8 closeout notes live in `docs/phase8-css-ui-closeout.md`.
- Responsive smoke notes live in `docs/phase8-responsive-smoke.md`.

## Phase 9: Performance and UX Optimization

Status: complete.

Goal: make performance improvements intentionally, with measurement where useful,
instead of mixing them into every modernization PR.

Focus areas:

- Bundle size audit.
- Realistic seed data for measuring feed and pagination behavior.
- Media loading optimization.
- Feed pagination or infinite scroll if needed.
- React render profiling.
- TanStack Query stale time/cache tuning.
- Production asset compression and caching review.

Recommended PR chunks:

1. Performance baseline and inventory:
   - record current bundle/build output
   - capture baseline route/page load observations
   - identify largest frontend/runtime performance risks
   - avoid behavior changes in the baseline PR
   - baseline notes live in `docs/phase9-performance-baseline.md`
2. Seed data for performance scenarios:
   - add enough local development seed data to make feed volume meaningful
   - include a realistic mix of users, follows, likes, and post types
   - keep seed media lightweight and compatible with Active Storage
   - use the data to evaluate whether pagination or infinite scroll is needed
   - make the app easier to demonstrate during job-search portfolio review
   - seed data notes live in `docs/phase9-seed-data.md`
3. Bundle size cleanup:
   - review production bundle contents
   - remove or defer obvious unused/heavy dependencies if any remain
   - document any larger bundling work separately
   - bundle cleanup notes live in `docs/phase9-bundle-size-cleanup.md`
4. Media loading optimization:
   - audit avatar, image, audio, and video rendering behavior
   - add safe lazy-loading or sizing improvements where appropriate
   - keep Active Storage URL behavior unchanged
   - media loading notes live in `docs/phase9-media-loading-optimization.md`
5. Feed loading strategy:
   - evaluate whether current feed loading needs pagination or infinite scroll
   - document the backend/frontend contract needed before implementation
   - implement only if the app has enough data volume to justify it
   - feed loading notes live in `docs/phase9-feed-loading-strategy.md`
6. React render and query tuning:
   - profile high-traffic components such as dashboard, feed, feed item, and
     recommended users
   - review TanStack Query stale time/cache behavior
   - tune only measured or clearly noisy paths
   - render/query tuning notes live in
     `docs/phase9-render-query-tuning.md`
7. Production asset and caching review:
   - review Rails/Webpack asset compression and cache headers
   - document deploy-time or hosting-specific recommendations
   - keep Vite migration separate unless explicitly starting that project
   - production asset/caching notes live in
     `docs/phase9-production-asset-caching.md`

## Phase 10: UI Polish and Post Editing

Status: complete.

Goal: improve release-quality visual polish and add post editing before release,
while keeping Vite/build-tooling work separate.

Focus areas:

- Dashboard, feed, post card, post action, and recommended-user visual polish.
- Auth page polish.
- Modal and form polish.
- Edit post behavior for owned posts.
- Focus states, button semantics, and responsive release smoke checks.

Recommended PR chunks:

1. UI polish inventory:
   - audit auth, dashboard, feed, post bar, modals, recommended users, and
     responsive states
   - document edit-flow decisions before implementation
   - avoid behavior changes in the inventory PR
   - inventory notes live in `docs/phase10-ui-polish-inventory.md`
2. Dashboard/feed polish:
   - improve post card spacing, action controls, focus states, and feed rhythm
   - polish the post bar by replacing divider lines with bordered post type
     buttons
   - keep changes CSS-focused and reviewable
3. Modal/form polish:
   - normalize modal spacing, form controls, previews, and button states
   - preserve create behavior
4. Auth page polish:
   - improve layout, spacing, semantic controls, and responsive behavior
5. Edit post API and query hook:
   - add frontend update mutation support
   - confirm backend edit contract with focused tests
   - keep post type changes out of initial scope unless explicitly chosen
6. Edit post frontend flow:
   - wire the author edit button
   - support text, quote, and link editing first unless media edit behavior is
     already decided
   - update the feed cache after successful edits
7. Media edit support:
   - add caption/title-only media edit behavior
   - add focused tests for the chosen media edit path
8. Release polish smoke pass:
   - run focused tests and build
   - smoke-check auth, dashboard, create, edit, delete, follow, like, and
     responsive layouts
   - release closeout notes live in `docs/phase10-release-smoke-closeout.md`
   - closeout notes live in `docs/frontend-modernization-closeout.md`

## Frontend Modernization Closeout

Status: complete.

Phases 1-10 are the completed frontend modernization track. The app now uses
React 19 functional components, hooks, TanStack Query for server state, fetch
API utilities, React Router modernization, component behavior tests, feed
pagination, media loading improvements, responsive UI polish, and post editing.

The remaining frontend-adjacent work is no longer part of this modernization
track:

- Vite migration is a separate future build-tooling project.
- Media edits are intentionally caption/title-only.
- Backend production readiness and performance should continue as a separate
  production-readiness track.

## Frontend Follow-Up: Accessibility Audit

Status: initial pass complete.

Goal: continue app-wide accessibility hardening after the targeted icon-label,
hover-state, and first audit pass.

The initial audit pass lives in `docs/app-wide-accessibility-audit.md` and added
low-risk form labels, autocomplete hints, form error live-region semantics, and
modal footer button types.

Remaining scope:

- Keyboard-only navigation across auth, dashboard, feed, post forms, edit modal,
  delete confirmation, recommended users, and social links. Automated keyboard
  coverage and focus styling pass complete; repeat the live browser smoke pass
  when local browser tooling is available.
- Screen reader labels, landmarks, headings, and icon-only controls.
- Modal behavior, including focus management, Escape handling, focus return, and
  background interaction. Complete.
- Color contrast and visible focus states.
- Form label coverage beyond placeholder text.
- Automated checks with axe or a similar tool where practical.
- Manual desktop/mobile smoke pass for accessibility-sensitive flows.

Keep this as its own focused PR/phase so it does not get mixed into visual
polish or backend production work.

## Production Readiness Track

This track starts after the frontend modernization phases are complete. It is
not a continuation of the frontend modernization plan; it focuses on preparing
the Rails backend and production system behavior for release.

## Phase 11: Backend Production Readiness and Performance

Status: complete.

Goal: make the Rails API safer, easier to deploy, and better prepared for
production traffic without changing frontend response contracts unnecessarily.

Focus areas:

- Backend performance inventory.
- Feed query ownership and database-backed ordering.
- Database indexes for high-traffic associations.
- Jbuilder serialization query behavior.
- Production config, secrets, logging, caching, and deployment assumptions.
- Render production hosting setup.
- Health checks and website status monitoring.
- Backend smoke and closeout documentation.

Recommended PR chunks:

1. Backend performance inventory:
   - audit controllers, models, Jbuilder views, routes, and schema indexes
   - document current query-heavy paths before changing behavior
   - note that `Api::PostsController` is relatively lean and mostly owns
     request orchestration
   - identify non-controller logic currently living in shared controller helpers
   - avoid behavior changes in the inventory PR
   - inventory notes live in `docs/phase11-backend-performance-inventory.md`
2. Feed query boundary cleanup:
   - move feed query construction out of `ApplicationController`
   - consider `Post.feed_for(user)` / `Post.visible_to(user)` or a small
     `FeedQuery` object for current-user-plus-followed-author lookup
   - keep request param handling for `page`, `per_page`, and pagination close to
     the controller or query object
   - preserve the current feed response shape: `posts`, `post_ids`, and
     `pagination`
3. Feed query optimization:
   - optimize `GET /api/posts` after the query boundary is clearer
   - keep newest-first ordering database-backed with deterministic `id`
     tie-breaking
   - add or extend tests for ordering, pagination, own posts, and followed-user
     posts
4. Database indexes:
   - add indexes for high-traffic lookup paths such as post authors, likes, and
     follows
   - add uniqueness indexes where model behavior requires unique likes or
     follows
   - keep migrations focused and independently reviewable
5. Jbuilder/API serialization review:
   - review `post.followers_ids.include?(current_user.id)`,
     `post.likers_ids.include?(current_user.id)`, `post.likes.count`, and
     author/avatar lookups for feed-page query cost
   - optimize query/preload behavior before changing serializer libraries
   - preload authors and attachments where useful
   - consider computing current-user liked/followed sets once per feed response
   - decide whether Jbuilder remains sufficient after query cleanup or whether
     a serializer such as Blueprinter would improve readability/performance
   - if migrating away from Jbuilder, do it in a separate follow-up PR after
     response contracts and tests are stable
   - keep frontend field names stable
6. Production config, hosting, and secrets review:
   - review production logging, static asset serving, Active Storage settings,
     cache settings, and required environment variables
   - compare hosting options before choosing a target platform
   - evaluate hosting candidates for Rails/PostgreSQL support, persistent
     storage assumptions, Active Storage/S3 compatibility, background-job
     needs, deploy complexity, cost, logs/metrics, SSL/custom domains, and
     environment variable management
   - review `SECRET_KEY_BASE`, Rails credentials vs platform env vars, and
     session/cookie security assumptions
   - confirm no secrets, local artifacts, or provider-specific credentials are
     committed
   - verify production Active Storage S3 configuration expectations
   - confirm required AWS/S3 environment variables:
     `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_REGION`,
     `S3_BUCKET_NAME`, and `ACTIVE_STORAGE_SERVICE`
   - document expected bucket permissions and CORS assumptions
   - smoke-check upload and render behavior against the selected storage
     service when production storage is available
   - document hosting-neutral deployment requirements
   - review notes live in `docs/backend-production-readiness.md`
   - avoid provider-specific changes until the hosting target is selected
7. Render production hosting setup:
   - use Render as the selected production hosting target for now
   - keep the initial setup cost-conscious: Starter web service, Basic-256mb
     Postgres, and S3 for Active Storage media
   - update production database config to prefer `DATABASE_URL` while retaining
     the existing password-based fallback for non-Render deployments
   - add a Render build/deploy script or documented build commands for
     JavaScript bundle build, Rails asset precompile, and migrations
   - document required Render environment variables and which values must be
     configured manually in the dashboard
   - avoid committing secrets, provider credentials, or generated production
     artifacts
   - decide whether to use dashboard-managed Render services first, and defer
     `render.yaml` until repo-managed infrastructure is clearly useful
   - document post-deploy smoke checks for auth, feed pagination, follows,
     likes, post create/edit/delete, and media upload/render
   - Render setup notes live in `docs/render-production-setup.md`
8. Health check and monitoring review:
   - add `GET /up` as a lightweight health/status check for production
   - verify Rails boot and database reachability without exposing sensitive data
   - return HTTP 503 when the database check fails
   - document Render logs and metrics as the minimum launch monitoring path
   - keep external error reporting such as Sentry, Honeybadger, or Rollbar as a
     later add-on unless production visibility needs grow
9. Backend closeout and smoke pass:
   - run focused Rails model/controller tests
   - run frontend build only if API response contracts are touched
   - document final production-readiness status and remaining deployment
     decisions
   - closeout notes live in `docs/phase11-backend-closeout.md`

## Future Account Recovery: Forgotten Password

Status: implementation in progress. The initial profile/settings page is
complete, and the email-identity PR is pending review.

Goal: allow users who cannot provide their current password to securely reset
it through a verified recovery channel.

The detailed recovery design, agreed decisions, open questions, and proposed PR
sequence live in
[`docs/forgotten-password-plan.md`](./docs/forgotten-password-plan.md).

Prerequisites and scope:

- add an email address to user accounts and require email verification
- provide a forgotten-password request form without revealing whether an
  account exists
- issue short-lived, single-use reset tokens and store only token digests
- deliver reset links through transactional email infrastructure
- provide a reset page for entering and confirming a new password
- expire and invalidate tokens after use, password changes, or a newer request
- rate-limit recovery requests and avoid logging passwords or raw reset tokens
- add backend, frontend, email-delivery, expiration, and abuse-case tests

Keep this separate from the initial settings-page password form, which should
continue to require the authenticated user's current password.

## Future Build Tooling: Vite

Status: planned.

Goal: revisit Vite as a dedicated asset integration project once the Rails asset
boundary is cleaner.

Vite is still the preferred long-term direction for a small modern React app,
but the current Webpack/Babel setup is now documented and stable enough to keep
using while higher-priority behavior and backend work continues.

## Guardrails

- Keep the app working after each chunk.
- Migrate one feature slice at a time.
- Do not remove Redux until the migrated slice no longer imports it.
- Do not mix router modernization into Phase 1.
- Preserve Rails CSRF/session-cookie behavior.
- Preserve Active Storage media rendering and upload behavior.
- Prefer focused query invalidation after mutations.
- Run `npm run build` after meaningful frontend changes.
- Browser-smoke login, dashboard, media rendering, and post creation after major
  frontend slices.

## Phase 1 Definition of Done

- Active app code no longer imports Redux actions, reducers, or store.
- API calls use `fetch`, not jQuery AJAX.
- TanStack Query owns server/API state.
- Zustand owns only client/UI state.
- Auth, dashboard, posts, users, likes, and follows work.
- Media upload and rendering still work with Active Storage.
- `npm run build` passes.
- Primary manual smoke checks pass.
