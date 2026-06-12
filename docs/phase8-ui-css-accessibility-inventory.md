# Phase 8 UI, CSS, and Accessibility Inventory

Phase 8 should improve the app's UI structure, CSS health, and accessibility
without mixing in behavior rewrites. This inventory records the first scan of
active frontend components and Rails stylesheets so follow-up PRs can stay
small and focused.

## Scope

Scanned:

- `frontend/components/**/*`
- `frontend/test/**/*`
- `app/assets/stylesheets/**/*`
- `app/assets/config/manifest.js`

Out of scope for this inventory:

- behavior fixes
- broad visual redesign
- performance tuning
- full responsive implementation

## High-Priority Accessibility Findings

### Feed Icon Controls

Files:

- `frontend/components/feed/feed_item_parts.jsx`
- `frontend/components/feed/feed_item_actions.test.jsx`

Findings:

- The like, unlike, edit, and delete controls are icon-only buttons.
- The icons are hidden from assistive tech with `aria-hidden="true"`.
- The buttons do not provide an accessible name.
- Tests still use CSS selectors such as `.like-btn-off`, `.like-btn-on`, and
  `.delete-post-btn` because role/name queries are not available yet.

Recommended follow-up:

- Phase 8-2 should add accessible labels to these controls.
- Update `feed_item_actions.test.jsx` to use `getByRole` where possible.
- Keep the visual appearance unchanged in that PR.

### Recommended User Follow Button

Files:

- `frontend/components/users/rec_user_item.jsx`
- `frontend/components/users/recommended_users.test.jsx`

Findings:

- The follow button is also icon-only.
- The icon is hidden with `aria-hidden="true"`.
- Tests currently select follow buttons by `.follow-user`.

Recommended follow-up:

- Add an accessible name such as `Follow Athos`.
- Update tests to query by role/name after the label exists.

### Post Bar Composer Buttons

Files:

- `frontend/components/posts/text_form.jsx`
- `frontend/components/posts/quote_form.jsx`
- `frontend/components/posts/link_form.jsx`
- `frontend/components/posts/photo_form.jsx`
- `frontend/components/posts/audio_form.jsx`
- `frontend/components/posts/video_form.jsx`

Findings:

- Composer buttons include visible text labels and icon markup.
- Each button wraps a `label` element even though the label is not associated
  with an input.
- The current markup works visually, but the nested label adds semantic noise.

Recommended follow-up:

- Keep visible labels.
- Replace non-input `label` wrappers with semantic container elements during the
  post form/modal cleanup.

### Auth Form Links Used As Actions

File:

- `frontend/components/auth_form/auth_form.jsx`

Findings:

- Login/signup submit and guest login use `Link` elements with click handlers.
- These actions perform mutations and route changes rather than plain
  navigation.

Recommended follow-up:

- Consider converting action links to buttons plus explicit navigation after
  successful mutations.
- Keep this separate from CSS-only work because it touches behavior semantics.

## CSS Structure Findings

### Empty Controller Stylesheet Stubs

Files:

- `app/assets/stylesheets/api/follows.scss`
- `app/assets/stylesheets/api/likes.scss`
- `app/assets/stylesheets/api/posts.scss`
- `app/assets/stylesheets/api/session.scss`
- `app/assets/stylesheets/api/users.scss`

Findings:

- These files only contain generated comments.
- They are included by `require_tree .` in `application.scss`.

Recommended follow-up:

- Remove them in a CSS cleanup PR if no Rails asset dependency needs them.

### Broad Stylesheet Imports

File:

- `app/assets/stylesheets/application.scss`

Findings:

- The stylesheet manifest uses both Sprockets `require_tree .` and explicit
  Sass imports.
- This can make CSS ordering and unused style cleanup harder to reason about.

Recommended follow-up:

- During CSS closeout, decide whether to rely on explicit imports only.
- Avoid changing this until component-specific cleanup has reduced uncertainty.

### Feed Fixed Widths

Files:

- `app/assets/stylesheets/components/_feed.scss`
- `app/assets/stylesheets/components/_posts.scss`
- `app/assets/stylesheets/components/_posts_bar.scss`
- `frontend/components/feed/feed_item_post_bodies.jsx`

Findings:

- Feed card, media, footer, post bar, and post content styles use many fixed
  pixel widths and heights.
- Audio/video elements also use fixed JSX `width` and `height` attributes.
- These choices are likely to create responsive layout issues on smaller
  screens.

Recommended follow-up:

- Phase 8-3 should normalize feed/card sizing.
- Phase 8-6 should handle mobile/tablet responsive behavior after the feed and
  form CSS is simpler.

### Modal and Form Global Rules

File:

- `app/assets/stylesheets/components/_modal.scss`

Findings:

- The file includes global `textarea` rules that can affect all textareas.
- Form layout relies on fixed widths around `494px` and `500px`.
- Media form, text form, quote form, and shared modal button styles live in the
  same file.

Recommended follow-up:

- Phase 8-4 should scope modal/form styles more clearly.
- Keep payload and form behavior unchanged.

### Auth Page Hard-Coded Asset URL

File:

- `app/assets/stylesheets/components/_auth_page.scss`

Findings:

- The auth page background references a hard-coded S3 development URL.
- The app already has the image in `app/assets/images/mac_table.png`.

Recommended follow-up:

- Move the background to the Rails asset pipeline reference or an imported
  frontend asset path during auth/dashboard styling cleanup.

### Duplicate Or Stale Dashboard Nav Styles

Files:

- `app/assets/stylesheets/components/_auth_page.scss`
- `app/assets/stylesheets/components/_dashboard.scss`

Findings:

- Dashboard nav styles appear in both files.
- `_auth_page.scss` still contains `.dash-nav` and `.dash-title` rules even
  though dashboard styles now have their own stylesheet.

Recommended follow-up:

- Phase 8-5 should consolidate dashboard styles and remove stale auth-page
  dashboard selectors.

## Responsive Findings

Files:

- `app/assets/stylesheets/components/_dashboard.scss`
- `app/assets/stylesheets/components/_feed.scss`
- `app/assets/stylesheets/components/_posts_bar.scss`
- `app/assets/stylesheets/components/_modal.scss`

Findings:

- No component stylesheet currently defines media queries.
- The dashboard uses `100vw`, `100vh`, absolute positioning, a fixed nav height,
  and scroll behavior on the feed column.
- The dashboard right column and feed column use fixed percentages/min-widths.

Recommended follow-up:

- Phase 8-6 should test at mobile, tablet, and desktop widths.
- Do the responsive pass after feed and form CSS cleanup so the fixes are not
  fighting stale layout assumptions.

## Interaction State Findings

Findings:

- Some hover styles exist for auth, feed follow buttons, posted links, post bar
  buttons, and logout.
- Focus styles are mostly concentrated around auth inputs.
- Icon-only feed/recommended-user controls lack clear focus-visible styling in
  the current CSS scan.
- Disabled styling exists for post submit buttons.

Recommended follow-up:

- Add focus-visible states when making accessibility fixes.
- Keep hover/focus/disabled visual cleanup close to the component area being
  cleaned up.

## Suggested Phase 8 Follow-Up Mapping

| Follow-up | Suggested PR |
| --- | --- |
| Feed icon labels and role-based tests | Phase 8-2 |
| Recommended user follow button label and test query cleanup | Phase 8-2 or Phase 8-5 |
| Feed fixed-width cleanup | Phase 8-3 |
| Feed media element sizing | Phase 8-3 or Phase 8-6 |
| Modal/form scoped CSS cleanup | Phase 8-4 |
| Post composer semantic wrapper cleanup | Phase 8-4 |
| Auth action link semantics | Later accessibility/behavior PR |
| Auth hard-coded S3 background URL | Phase 8-5 |
| Duplicate dashboard nav styles | Phase 8-5 |
| Empty controller SCSS stubs | Phase 8-7 |
| `require_tree` plus explicit import review | Phase 8-7 |

## Verification Notes

This PR is documentation-only. No runtime behavior or CSS was changed.
