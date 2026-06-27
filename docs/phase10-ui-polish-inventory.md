# Phase 10 UI Polish and Edit Feature Inventory

Phase 10 shifts from modernization infrastructure to release-quality product
polish. The goal is to make the app feel more intentional while keeping changes
small enough to review.

## Scope

- Improve the visual quality and interaction polish of the existing app.
- Add post editing before release.
- Keep Vite/build-tooling migration separate.
- Keep backend performance/index work separate unless an edit-flow issue needs
  a small API fix.

## Current UI Surfaces

### Auth Page

Current shape:

- Login/signup route renders a full-page auth layout.
- Auth buttons are styled links that submit mutations.
- Guest login fills credentials through a dedicated hook.

Polish candidates:

- Replace submit links with semantic buttons if the form behavior is being
  touched.
- Reduce `<br />` spacing in favor of CSS layout spacing.
- Tighten auth copy, visual hierarchy, and responsive spacing.
- Improve focus-visible states for nav and auth actions.
- Confirm mobile layout does not crowd the form against the footer.

### Dashboard Shell

Current shape:

- Fixed full-screen dashboard with a top nav, scrollable feed column, and right
  recommendation column.
- Right column stacks below the feed on smaller breakpoints.

Polish candidates:

- Improve nav sizing and title/logout balance.
- Make dashboard column spacing feel less rigid on wide screens.
- Ensure the feed column and right column have comfortable bottom spacing.
- Add or refine visible focus states for logout and footer links.
- Revisit whether the right column should stay fixed, sticky, or simply scroll
  with the page in later UX work.

### Feed and Post Cards

Current shape:

- Feed renders paginated posts newest-first.
- Post cards show author, follow/unfollow, content, likes, and author-only
  edit/delete controls.
- The edit button opens the edit flow for authored posts.

Polish candidates:

- Improve post card spacing, typography, and content hierarchy.
- Normalize icon button sizing, hit targets, hover, and focus states.
- Improve like/delete/edit grouping so author controls feel intentional.
- Revisit oversized text on seeded performance posts at smaller widths.
- Keep feed item extraction stable unless a polish change makes a small
  component split clearly useful.

### Post Bar and Modals

Current shape:

- Post bar opens one modal per post type.
- Modal styles are now SCSS-based.
- Body scroll is locked while modals are open.

Polish candidates:

- Remove divider-line treatment and put borders directly on each post type
  button so the bar reads as a set of intentional actions.
- Improve modal button layout, disabled states, and focus states.
- Replace form spacing hacks with consistent CSS spacing.
- Review upload previews for image, audio, and video forms.
- Make the modal title/purpose more obvious for each post type.
- Avoid combining create-form polish with edit-form behavior unless reuse makes
  the change smaller.

### Recommended Users

Current shape:

- Recommended users render in the dashboard right column.
- Follow controls are icon-only with accessible names.

Polish candidates:

- Improve row spacing and hover/focus treatment.
- Make empty and loading states feel intentional.
- Consider whether the list should visually separate app recommendations from
  external footer links.

## Edit Feature Inventory

Backend status:

- `Api::PostsController#update` already supports updating current-user posts.
- The permitted params include `title`, `body`, `url`, `image`, and `post_type`.
- Existing controller tests cover updating text fields and attaching uploaded
  media to a current-user post.

Frontend status:

- `AuthorControls` renders an edit button for authored posts.
- TanStack Query hooks include create/delete/update/like/unlike behavior.
- Text, quote, and link posts use an edit form for editable fields.
- Media posts support caption/title-only edits while preserving existing
  attachments.

Edit behavior decisions:

- Text, quote, and link editing are supported.
- Media posts support caption/title-only edits.
- Post type changes during edit are not supported.

## Suggested Phase 10 PR Chunks

1. UI polish inventory:
   - document current visual/UX issues and edit-flow decisions
   - avoid behavior changes
   - inventory notes live in this file
2. Dashboard/feed polish:
   - improve post card spacing, action controls, focus states, and feed rhythm
   - polish the post bar by replacing divider lines with bordered post type
     buttons
   - keep changes CSS-focused
3. Modal/form polish:
   - normalize modal spacing, form controls, previews, and button states
   - preserve create behavior
4. Auth page polish:
   - improve layout, spacing, semantic controls, and responsive behavior
5. Edit post API and query hook:
   - add a frontend update mutation
   - confirm/update backend tests for the edit contract
   - keep the UI minimal
6. Edit post frontend flow:
   - wire the author edit button
   - support text/quote/link first unless media behavior is already decided
   - update the feed cache after successful edits
7. Media edit support:
   - add caption/title-only media edit behavior
   - add tests for the chosen media edit path
8. Release polish smoke pass:
   - run focused tests and build
   - browser-smoke auth, dashboard, create, edit, delete, follow, like, and
     responsive layouts

## Initial Recommendation

Start Phase 10 with CSS-focused dashboard/feed polish before implementing edit
posts. The feed is where edit controls live, so improving the visual treatment
of post actions first should make the edit flow easier to add cleanly.
