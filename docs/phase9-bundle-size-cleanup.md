# Phase 9 Bundle Size Cleanup

Phase 9-3 keeps the app on Webpack for now, but tightens the production bundle
configuration before moving on to media and feed-loading performance work.

## Changes

- Removed the manual production `DefinePlugin` setup from `webpack.config.js`.
- Relied on Webpack 5 `mode: "production"` to define production environment
  behavior.
- Kept source maps for development builds.
- Disabled source maps for production builds.

## Why

The previous config used an object-style `DefinePlugin` value for
`process.env`. Webpack production mode already handles this, and letting mode do
the environment replacement gives React and React DOM the expected production
dead-code elimination path.

Production source maps also added a large extra asset. They are useful during
debugging, but this project does not currently have production error reporting
or source-map upload infrastructure, so emitting them by default makes the
deployed asset set heavier without a matching operational benefit.

## Build Result

Production snapshot command:

```sh
NODE_ENV=production npx webpack --mode production --output-path /private/tmp/picmes-webpack-phase9-3 --output-filename bundle.js
```

Result:

- Webpack compiled successfully with the existing asset-size warnings.
- `bundle.js`: 329 KiB reported by Webpack.
- temp `bundle.js`: 336,444 bytes.
- temp `bundle.js.LICENSE.txt`: 1,738 bytes.
- gzipped temp `bundle.js`: 99,726 bytes.
- no production `bundle.js.map` was emitted.

Previous Phase 9-1 production snapshot:

- temp `bundle.js`: 1,177,049 bytes.
- temp `bundle.js.map`: 1,456,382 bytes.
- gzipped temp `bundle.js`: 227,970 bytes.

The app still ships a single bundle and still exceeds Webpack's default
production asset-size warning. Larger structural changes, such as route-level
code splitting or a Vite migration, should remain separate work.
