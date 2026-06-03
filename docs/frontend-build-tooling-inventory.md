# Frontend Build Tooling Inventory

This inventory captures the current Rails, Sprockets, Webpack, and Babel setup
before Phase 3 build tooling changes.

## Current Tooling

Node and npm:

- `.nvmrc`: `24.11.0`
- `package.json` engines:
  - Node `24.11.0`
  - npm `11.6.2`

JavaScript build:

- Webpack config: `webpack.config.js`
- Entry point: `frontend/picmes.jsx`
- Output directory: `app/assets/javascripts`
- Output file: `bundle.js`
- Source map: `bundle.js.map`
- Build command: `npm run build`
- Watch command: `npm run webpack`
- Install hook: `postinstall` runs `webpack`

Babel:

- Babel is configured inline in `webpack.config.js`.
- Active presets:
  - `@babel/preset-env`
  - `@babel/preset-react`
- There is no root `.babelrc` or `babel.config.js`.

Rails assets:

- Rails layout includes `javascript_include_tag 'application'`.
- `app/assets/javascripts/application.js` uses `//= require_tree .`.
- `app/assets/config/manifest.js` links the javascripts directory.
- Webpack writes `bundle.js` into the Sprockets JavaScript tree, and Sprockets
  includes it through `require_tree`.
- `bundle.js` and `bundle.js.map` are generated files and are ignored by git.

Stylesheets:

- CSS/SCSS is still owned by Sprockets.
- Rails layout includes `stylesheet_link_tag 'application'`.
- `app/assets/stylesheets/application.scss` imports reset, colors, component
  styles, and `font-awesome`.

## Current Dependency Notes

Webpack-related packages:

- `webpack`
- `webpack-cli`
- `terser-webpack-plugin`
- `babel-loader`

Babel-related packages:

- `@babel/core`
- `@babel/preset-env`
- `@babel/preset-react`

Legacy dependency to review:

- `babel-core` is still listed in `dependencies`, but the active Webpack loader
  uses `@babel/core`. This is likely removable after build verification.

Rails asset dependencies to review:

- `coffee-rails` is still present.
- The only `.coffee` files under `app/assets/javascripts/api` are empty
  generated placeholders.
- `sass-rails` and Sprockets still actively support the stylesheet pipeline.

## Current Build Flow

1. `npm run build` runs Webpack.
2. Webpack compiles `frontend/picmes.jsx`.
3. Webpack writes `app/assets/javascripts/bundle.js`.
4. Rails serves `application.js`.
5. Sprockets `require_tree .` includes generated `bundle.js`.
6. React mounts into `<main id="root"></main>` from
   `app/views/static_pages/root.html.erb`.

## Behavior To Preserve

- Rails root page still renders the React mount element.
- Rails root page still hydrates `window.currentUser` for logged-in refreshes.
- CSRF meta tags remain available to the frontend API client.
- The compiled frontend bundle is available in development and production.
- Production assets work with `config.assets.compile = false`.
- Existing SCSS and image assets continue to load through Sprockets.
- `npm run build` remains the reliable frontend verification command until a
  replacement is introduced.

## Migration Options

### Option A: Keep Webpack And Modernize Configuration

Scope:

- Keep the current Rails/Sprockets integration.
- Move Babel config out of the inline Webpack loader if useful.
- Remove unused dependencies such as `babel-core` after verification.
- Remove empty CoffeeScript placeholders and `coffee-rails` if Rails still
  boots and assets compile without it.
- Make script names clearer, such as `build` and `build:watch`.

Pros:

- Lowest risk.
- Minimal Rails asset changes.
- Best fit if the priority is finishing modernization without changing deploy
  shape.

Cons:

- Keeps a custom Webpack-to-Sprockets bridge.
- Does not improve dev server ergonomics much.

### Option B: Move JavaScript To Vite And Keep CSS In Sprockets

Scope:

- Add Vite for JavaScript bundling.
- Keep Rails/Sprockets for SCSS, images, and existing asset helpers.
- Update Rails layout to include the Vite-built JavaScript output.
- Decide where Vite should write production assets.

Pros:

- Modern JavaScript dev/build tooling.
- Faster local frontend iteration.
- Keeps stylesheet migration out of scope.

Cons:

- Requires careful Rails asset integration.
- Needs a clear production asset story before deploy.
- May need a dev-server setup or Vite manifest integration.

### Option C: Full Vite Frontend Asset Migration

Scope:

- Move JavaScript and stylesheets into Vite.
- Retire most Sprockets frontend asset responsibilities.
- Update Rails layout and asset paths accordingly.

Pros:

- Cleanest modern frontend tooling boundary.
- Best long-term frontend ergonomics.

Cons:

- Highest migration risk.
- Mixes JavaScript, stylesheet, font, image, and Rails layout changes.
- Too large for the next focused PR.

## Recommendation

Use Option A first, with Option B as the intended future direction.

The current app has a small frontend surface and a working Webpack 5 build. The
least risky next PR should modernize the existing Webpack/Babel setup and remove
obvious unused build dependencies/placeholders only after verification. A Vite
migration can still happen later, but it should be a deliberate asset integration
project rather than a default next step.

The long-term preference is to move JavaScript builds to Vite. This project is
small enough that Vite should be a good fit once the Rails asset boundary is
cleaner, and it should reduce the amount of build tooling the app needs to carry.
The immediate Webpack modernization work should avoid changes that make a later
Vite migration harder.

Suggested next PR:

- remove or confirm `babel-core`
- remove empty CoffeeScript asset placeholders if safe
- evaluate removing `coffee-rails`
- rename `webpack` script to a clearer watch script if desired
- keep generated bundle output and Rails layout behavior unchanged
