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

Recommended PR chunks:

1. Component inventory and low-risk cleanup:
   - document remaining class components
   - classify conversion risk
   - remove dead files and no-op constructors
   - avoid behavior rewrites
2. Shell and route components:
   - `App`
   - `Root`
   - route wrappers in `route_util.jsx`
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
   - run the full Phase 2 smoke checklist

Current component inventory:

| Component | Current shape | State/lifecycle | Phase 2 PR |
| --- | --- | --- | --- |
| `Dashboard` | class | render-only | PR 2 |
| `Feed` | class | render-only | PR 2 |
| `RecommendedUsers` | function | none | already modern enough |
| `RecUserItem` | class | render-only | PR 2 |
| `PostBar` | class | render-only | PR 7 |
| `FeedItem` | class | render helpers only | PR 3 |
| `AuthForm` | class | local credentials, `componentDidUpdate` redirect | PR 4 |
| `TextForm` | class | modal/input state | PR 5 |
| `QuoteForm` | class | modal/input state | PR 5 |
| `LinkForm` | class | modal/input state | PR 5 |
| `PhotoForm` | class | modal/input/file preview state | PR 6 |
| `AudioForm` | class | modal/input/file preview state | PR 6 |
| `VideoForm` | class | modal/input/file preview state | PR 6 |

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
