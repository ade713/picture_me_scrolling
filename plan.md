# Frontend Modernization Plan

This plan documents the selected direction for modernizing the Picture Me
Scrolling frontend.

The app is already on React 19, but several frontend patterns are still from the
older Redux/class-component era. The goal is to modernize the app in phases
without combining too many high-risk changes at once.

## Chosen Direction

Use:

- React functional components and hooks
- TanStack Query for server/API state
- Zustand for client/UI state
- native `fetch` for API requests

Remove over time:

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

Status: planned.

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
7. Frontend smoke test harness:
   - add a lightweight repeatable smoke script or documented browser smoke
     checklist
   - cover login, dashboard load, media rendering, follow/unfollow,
     like/unlike, and post creation
   - avoid heavy frontend test infrastructure unless it proves useful
8. Phase 7 verification and closeout:
   - run the relevant Rails test suite
   - run the frontend build
   - update docs and the plan with covered behavior and remaining intentional
     manual checks
   - mark Phase 7 complete

## Phase 8: CSS and UI Cleanup

Status: planned.

Goal: clean styling and UI structure after the app behavior and architecture are
stable.

Focus areas:

- Review CSS class names that no longer match the component structure.
- Remove unused CSS.
- Normalize feed, modal, form, and dashboard styling.
- Improve responsive behavior.
- Keep visual cleanup separate from behavior fixes.

## Phase 9: Performance and UX Optimization

Status: planned.

Goal: make performance improvements intentionally, with measurement where useful,
instead of mixing them into every modernization PR.

Focus areas:

- Bundle size audit.
- Media loading optimization.
- Feed pagination or infinite scroll if needed.
- React render profiling.
- TanStack Query stale time/cache tuning.
- Production asset compression and caching review.

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
