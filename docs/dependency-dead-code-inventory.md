# Dependency and Dead-Code Inventory

Phase 5-1 inventory for dependency cleanup, dead-code cleanup, and stale docs
references after frontend modernization.

## Commands Run

```sh
rg --files frontend app/assets docs
rg "from ['\"]|import |require\(|zustand|lodash|react-modal|@tanstack|jquery|Redux|redux|connect\(|\.coffee|Paperclip|Heroku|babel-core|animate\.css|coffee-rails" frontend app docs README.md Gemfile package.json
npm ls react-router react-router-dom zustand lodash --depth=1
npm audit --omit=dev
npm outdated
```

The first `npm audit` and `npm outdated` attempts failed in the sandbox because
registry access was blocked. The commands were rerun with network access.

## Frontend Package Findings

Safe cleanup candidates for Phase 5-2:

- `zustand` is installed but has no active imports.
  - It was part of the chosen modernization direction for client-only UI state.
  - The current app does not yet have shared UI state that needs it.
  - Recommendation: remove it for now, and re-add later if a real shared UI
    store appears.
- `lodash` is only used for `values` in:
  - `frontend/query/post_hooks.js`
  - `frontend/query/user_hooks.js`
  - Recommendation: replace with `Object.values` and remove `lodash`.
- `react-router` is installed directly and also appears under
  `react-router-dom`.
  - Active frontend imports use `react-router-dom`.
  - Recommendation: test removing the direct `react-router` dependency while
    keeping `react-router-dom`.

Packages that are actively used and should stay:

- `@tanstack/react-query`
- `react`
- `react-dom`
- `react-modal`
- `react-router-dom`

Build packages that are active:

- `webpack`
- `webpack-cli`
- `babel-loader`
- `@babel/core`
- `@babel/preset-env`
- `@babel/preset-react`
- `terser-webpack-plugin`

Potential follow-up:

- Consider moving build-only packages from `dependencies` to `devDependencies`
  only if deployment/install behavior still provides them where `postinstall`
  runs. Do not move them without verifying the production build path.

## Frontend Dead-Code Findings

The local JS/JSX import graph did not find orphaned frontend files under
`frontend/`.

No active frontend code references were found for:

- Redux imports or `connect`
- jQuery/AJAX usage
- React Router v5 APIs
- `animate.css`

## Package Audit and Freshness

`npm audit --omit=dev` reported 6 fixable vulnerabilities:

- `ajv`
- `fast-uri`
- `lodash`
- `serialize-javascript`
- `terser-webpack-plugin`
- `webpack`

`npm outdated` reported patch/minor updates for:

- Babel packages
- TanStack Query
- `babel-loader`
- `lodash`
- React and React DOM
- React Router packages
- `terser-webpack-plugin`
- `webpack`
- `webpack-cli`
- `zustand`

Recommendation:

- Phase 5-2 should remove obvious unused packages first.
- A separate dependency refresh can then run `npm audit fix` or targeted package
  updates with `npm run build` verification.

## Rails Dependency Findings

Dependencies that appear active or intentionally retained:

- `jbuilder` is used for API JSON views.
- `sass-rails` supports the current SCSS pipeline.
- `font-awesome-sass` is imported from `application.scss`, though the layout
  also loads Font Awesome from a CDN. This duplication should be checked before
  removal.
- `uglifier` is referenced by `config.assets.js_compressor` in production.
- `aws-sdk-s3` is required from `config/application.rb`.
- `figaro` is still part of application configuration.
- `paperclip` is still tied to migration compatibility, old columns, and
  production rollout notes. Do not remove until Active Storage production data
  cleanup is complete.
- `coffee-rails` is documented as intentionally kept because Sprockets 3 loads
  its CoffeeScript processor while resolving assets.

Rails cleanup candidates that need proof in Phase 5-3 or Phase 6:

- `activestorage` gem may be redundant with Rails 7. Verify before removal.
- `font-awesome-sass` may be redundant with the CDN stylesheet. Verify rendered
  icons and SCSS imports before removal.
- development-only tools such as `annotate`, `byebug`, `pry-rails`,
  `better_errors`, `binding_of_caller`, `web-console`, and `spring` should be
  reviewed separately from runtime dependencies.

## Stale Documentation Findings

Docs references that are intentional and should stay for now:

- Paperclip references in `docs/active-storage-production-rollout.md`
- Heroku references in `docs/active-storage-production-rollout.md`
- `coffee-rails` references in `docs/frontend-build-tooling-inventory.md`

Docs references that are stale candidates for Phase 5-4:

- `docs/README.md` still references the old Heroku app and MVP hosting plan.

## Recommended Next PRs

Phase 5-2:

- Replace `lodash` `values` usage with `Object.values`.
- Remove `lodash`.
- Remove unused `zustand`.
- Test whether direct `react-router` can be removed while keeping
  `react-router-dom`.
- Run `npm run build`.

Phase 5-3:

- Re-check `coffee-rails` with Rails asset boot/build checks.
- Verify whether the standalone `activestorage` gem is still needed.
- Review Font Awesome duplication between `font-awesome-sass` and CDN usage.

Phase 5-4:

- Clean stale `docs/README.md` Heroku/MVP references.
- Remove any obsolete docs/files confirmed by earlier Phase 5 chunks.
