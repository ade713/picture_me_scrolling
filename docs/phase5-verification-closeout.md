# Phase 5 Verification Closeout

Phase 5 removed or documented dependency and dead-code cleanup findings after
the frontend modernization work.

## Completed Cleanup

- Removed unused frontend dependencies:
  - `lodash`
  - `zustand`
  - direct `react-router`
- Kept `react-router-dom`; `react-router` remains only as its transitive
  dependency.
- Removed redundant Rails asset dependencies:
  - direct `activestorage` Gemfile entry
  - `font-awesome-sass`
- Kept `coffee-rails` because Sprockets 3 still needs its CoffeeScript processor
  while resolving assets.
- Removed stale Heroku hosting references from `docs/README.md`.

## Verification

Commands run:

```sh
npm run build
bin/rails runner 'puts({ css: Rails.application.assets.find_asset("application.css").present?, js: Rails.application.assets.find_asset("application.js").present?, active_storage: defined?(ActiveStorage::Blob).present? }.inspect)'
```

Results:

- Webpack compiled successfully.
- Rails resolved `application.css`.
- Rails resolved `application.js`.
- `ActiveStorage::Blob` remained available through Rails.

## Remaining Follow-Up

- Build-tool advisories remain in `npm audit --omit=dev` and should be handled
  with a targeted dependency refresh. Current count: 5 vulnerabilities
  reported through `ajv`, `fast-uri`, `serialize-javascript`,
  `terser-webpack-plugin`, and `webpack`.
- Paperclip references remain intentionally documented until the Active Storage
  production/data cleanup is complete.
- `coffee-rails` should be revisited when Sprockets is upgraded or replaced.
