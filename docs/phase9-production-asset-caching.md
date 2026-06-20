# Phase 9 Production Asset and Caching Review

Phase 9-7 reviews the current Rails/Sprockets/Webpack production asset path and
adds one low-risk cache-header improvement for deployments where Rails serves
compiled static assets.

## Current Asset Path

- Webpack compiles `frontend/picmes.jsx` to
  `app/assets/javascripts/bundle.js`.
- Sprockets includes `bundle.js` through `app/assets/javascripts/application.js`
  and the `require_tree .` directive.
- Sprockets compiles SCSS through `app/assets/stylesheets/application.scss`.
- `app/assets/config/manifest.js` links images, JavaScript, and stylesheet
  outputs for precompilation.
- Production keeps `config.assets.compile = false`, so assets must be built and
  precompiled before deploy.

## Production Config Change

`config/environments/production.rb` now sets:

```rb
config.public_file_server.headers = {
  'Cache-Control' => 'public, max-age=31536000, immutable'
}
```

This only applies when Rails serves static files, controlled by
`RAILS_SERVE_STATIC_FILES`. It gives fingerprinted compiled assets a long-lived
cache policy and avoids repeated downloads for unchanged production assets.

## Deployment Notes

Before a production deploy, run:

```sh
NODE_ENV=production npm run build
RAILS_ENV=production bin/rails assets:precompile
```

The selected host should do one of the following:

- serve precompiled assets directly through a static file layer or CDN, or
- set `RAILS_SERVE_STATIC_FILES=true` so Rails serves the compiled assets with
  the cache headers above.

If a CDN or reverse proxy fronts the app, preserve or intentionally override the
Rails `Cache-Control` header for fingerprinted assets.

## Deferred

- Vite migration remains a separate future build-tooling project.
- Production CDN/provider-specific configuration should wait until hosting is
  selected.
- Replacing Uglifier or changing the Sprockets compressor should be handled as a
  separate asset-pipeline cleanup if the app stays on Sprockets.
