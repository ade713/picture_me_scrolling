# Tags Closeout

Status: implementation and live browser smoke checks complete; a physical
keyboard activation check remains before merge.

## Delivered Scope

- normalized explicit tags on all six post creation forms and post editing
- a maximum of five unique tags with Rails-authoritative validation
- atomic post, tag, and join writes through `PostWriter`
- alphabetized tag arrays in post API responses
- responsive, keyboard-accessible tag links on feed items
- URL-owned filtering through `#/dashboard?tag=<tag>`
- access-scoped backend filtering with filtered pagination metadata
- loading, error, empty, retry, clear-filter, focus, reload, and browser-history
  behavior for the filtered feed
- development and production-safe demo tags for representative display and
  multi-page filtering scenarios

Existing posts remain valid without tags. Deleting a post removes its join rows
through the database foreign key and Rails association; shared tag rows remain.

## Demo Scenarios

The development reset seed includes descriptive tags on representative posts
and applies `performance` to 120 guest-accessible posts. This gives the manual
smoke pass a stable multi-page filtered result.

The production-safe `DemoSeed` applies `demo_feed` to 18 posts by followed demo
users and `recommended` to posts by recommended users. It remains idempotent and
uses the same atomic writer as the API.

## Verification

Automated checks completed on August 13, 2026:

```sh
DISABLE_SPRING=1 bin/rails test
npm run test:frontend
npm run build
```

Results:

- Rails: 190 tests, 896 assertions, no failures or errors
- frontend: 22 files and 137 tests passed
- production Webpack build: completed successfully
- focused production-safe seed coverage: 3 tests and 14 assertions passed

Live browser checks completed on August 13, 2026:

- tag input normalized uppercase and surrounding whitespace
- duplicate and malformed tags were rejected with accessible feedback
- the five-tag limit disabled further entry and exposed accessible removal
  labels
- a temporary tagged post was created, its tag was replaced through editing,
  and the post was deleted afterward
- selecting `demo_feed` updated the URL and focused the filtered heading
- filtered pagination loaded all 18 matching accessible posts without changing
  the active filter
- reload, Back, Forward, and `Clear tag filter` kept URL and feed state in sync
- valid empty results rendered the centered `No posts found` state
- malformed filters rendered an announced error with a working retry action
- 375-by-812 and 1440-by-900 viewport checks showed no horizontal overflow;
  tag links wrapped and filter controls remained visible

Keyboard entry with Enter and visible focus placement were verified through the
browser controller. Its synthetic Enter and Space events focused native links
and buttons but did not activate them, so physical-keyboard activation of tag
removal and `Clear tag filter` remains a manual check rather than being marked
as passed.

## Deferred Work

- global discovery and public tag pages
- multi-tag filtering
- autocomplete, suggestions, and trending tags
- automatic hashtag parsing from post content
- tag renaming, administration, moderation, or reserved-name rules
- manual tag ordering or case-preserving display names
- automatic deletion of unused tag rows

These remain separate product decisions and are not required for the explicit,
followed-feed tag MVP.
