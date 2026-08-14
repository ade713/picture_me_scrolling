# Tags Design and Implementation Plan

Status: implementation and live browser verification complete; physical
keyboard activation verification pending. See
[`tags-closeout.md`](./tags-closeout.md) for delivered behavior, verification,
and deferred work.

## Goal

Add explicit tags to posts so users can organize and filter the posts already
available in their followed-user feed.

The first version should remain a focused organization feature. It should not
introduce global discovery, parse hashtags from post content, or require a new
client-state store.

## Agreed Product Scope

Users can:

- add up to five tags while creating any post type
- add, remove, or replace tags while editing a post
- see tags below post content and above the post footer
- select a tag to filter the existing dashboard feed
- clear the active tag filter and return to the full dashboard feed

Tag filtering applies only to:

- the current user's posts
- posts authored by users the current user follows

Tags do not expose posts from unfollowed users. Global tag discovery is outside
the MVP.

## Explicit Tags

Tags are explicit post metadata entered through a dedicated TagInput. PicMeS
will not parse `#words` from post titles, captions, quotes, or other content.

For example, writing this in a caption does not attach a tag:

```text
Experimenting with #photography in the rain.
```

The user must add `photography` through TagInput. The API then receives:

```json
{
  "post": {
    "tags": ["photography"]
  }
}
```

This keeps validation, editing, filtering, and behavior consistent across all
post types. Automatic hashtag parsing or tag suggestions may be considered
later, but explicit tag associations remain authoritative.

## Validation and Normalization

Rails owns the authoritative validation rules. The frontend mirrors them for
immediate feedback.

Agreed rules:

- maximum five unique tags per post
- maximum 30 characters per tag
- store tags in lowercase
- trim surrounding whitespace
- store tags without the leading `#`
- allow lowercase letters, numbers, and internal underscores
- reject spaces, hyphens, punctuation, leading or trailing underscores, and
  repeated underscores

The backend format is:

```ruby
NAME_FORMAT = /\A[a-z0-9]+(?:_[a-z0-9]+)*\z/
```

Examples:

```text
photography          valid
travel2026           valid
street_photography   valid
street-photography   invalid
street photography   invalid
_photography         invalid
photography_         invalid
street__photography  invalid
```

Duplicate detection occurs after normalization. The frontend prevents a
duplicate and displays feedback. The backend normalizes and deduplicates
defensively, and the five-tag limit counts unique normalized tags.

## TagInput Behavior

TagInput is shared by all six create forms and the edit form. It appears after
post-specific fields and before modal actions.

The component provides:

- an input labelled `Tags`
- selected tags rendered as removable chips
- guidance showing `n of 5 tags`
- format, length, duplicate, and maximum-count feedback
- disabled controls while the post mutation is pending
- accessible remove buttons such as `Remove photography tag`

A valid draft tag is committed when the user:

- presses Enter
- types a comma
- leaves the field
- submits the post form

An invalid draft blocks submission and displays validation feedback rather than
silently disappearing.

## Post Display

Tags display beneath post content and above the post footer:

```text
#city_views #photography #sunset
```

Tags are returned and displayed alphabetically. The join table does not need a
position column.

Once filtering is available, each displayed tag links to:

```text
#/dashboard?tag=photography
```

## Filtered Feed UI

The filtered dashboard displays:

```text
Posts tagged #photography
```

The compact filter-removal action is:

```text
× Clear
```

Its accessible name remains `Clear tag filter`.

The action removes the `tag` search parameter and returns to:

```text
#/dashboard
```

The empty state is:

```text
No posts found
```

The filtered feed preserves existing loading, error, retry, and infinite-
pagination behavior.

When a tag changes, the frontend should:

- reset pagination to page one
- scroll to the filtered-feed heading
- move focus to the heading so assistive technology announces the new context
- preserve browser Back, Forward, reload, and shared-URL behavior

Clearing the filter returns focus to the ordinary feed heading.

## Data Model

### `tags`

```text
id
name, not null
created_at
updated_at
```

`name` is normalized and URL-safe, so a separate slug column is unnecessary.
The table has a unique index on `name`.

### `post_tags`

```text
id
post_id, not null
tag_id, not null
created_at
updated_at
```

The join table has:

- a unique index on `[post_id, tag_id]`
- an index on `post_id`
- an index on `tag_id`
- foreign keys to posts and tags with `ON DELETE CASCADE`

Database-level cascade deletion is required because the existing post deletion
path uses `delete`, which bypasses Rails association callbacks.

Associations:

```ruby
class Post < ApplicationRecord
  has_many :post_tags, dependent: :destroy
  has_many :tags, through: :post_tags
end

class Tag < ApplicationRecord
  has_many :post_tags, dependent: :destroy
  has_many :posts, through: :post_tags
end

class PostTag < ApplicationRecord
  belongs_to :post
  belongs_to :tag
end
```

Unused tag rows may remain. They consume negligible storage for this
application and avoiding synchronous orphan cleanup keeps writes and concurrent
tag reuse simpler.

## API Contract

The public API uses the concise `tags` field. Backend internals may use
`tag_names` when distinguishing strings from `Tag` records.

Create and update request:

```json
{
  "post": {
    "title": "Evening light",
    "post_type": "photo",
    "tags": ["photography", "sunset"]
  }
}
```

Post response:

```json
{
  "tags": ["photography", "sunset"]
}
```

`has_many :tags` creates a Rails `post.tags=` setter that expects `Tag`
records. The controller must therefore extract tag strings before assigning
ordinary post attributes rather than passing the public payload directly into
the association setter.

Strong parameters permit:

```ruby
params.require(:post).permit(
  :title,
  :body,
  :url,
  :image,
  :post_type,
  tags: []
)
```

## Atomic Post Writes

`Api::PostsController` owns the post endpoints and tag input. The MVP does not
need a `TagsController` because tags have no independent create, update, index,
autocomplete, trending, or administration endpoint.

A focused post-writing service coordinates the multi-model transaction shared
by create and update. Its responsibilities are:

- normalize and validate tag strings
- assign and validate post attributes
- find or create reusable tag records
- replace post-tag associations
- commit the post, tags, and joins atomically

Expected behavior:

- invalid post attributes create no tags or post
- invalid tags create no post
- failed edits leave the post and its existing tag associations unchanged
- submitting an empty tag array removes all post-tag associations
- unused tag records may remain

A separate `TagsController` is deferred until tags gain independent behavior.

## Feed Filtering API

The filtered request is:

```http
GET /api/posts?tag=photography&page=1&per_page=20
```

`FeedQuery` applies operations in this order:

```text
current user's posts plus followed-user posts
→ tag filter
→ filtered count and pagination metadata
→ offset and limit
```

This order ensures `total_count`, `total_pages`, and `has_more` describe only
accessible matching posts.

Response behavior:

- no `tag` parameter returns the ordinary feed
- a valid existing tag returns matching accessible posts
- a valid nonexistent tag returns `200 OK` with an empty paginated feed
- a malformed tag returns `422 Unprocessable Entity`

The query must preload tags for serialization and use indexed joins to avoid
N+1 queries and unnecessary feed-query cost.

## Frontend State and Pagination

The URL is the source of truth for the active tag:

```text
#/dashboard?tag=photography
```

React Router reads and updates the search parameter. React Query owns filtered
server state, caching, and infinite pagination. The active normalized tag is
part of the feed query key.

Zustand is not introduced. A separate store would duplicate state across the
URL, React Query, and backend request parameters without eliminating the need
for server-side filtering.

Post create, update, and delete mutations invalidate the feed query family.
This allows the currently active full or filtered feed to refetch without
manually predicting every tag cache affected by a mutation.

## Existing Data and Seeds

- existing posts remain valid without tags
- no production backfill is required
- representative tags are included in development and production-safe demo
  seeds; the shared `demo_feed` and `performance` tags provide enough matches
  to exercise filtered pagination
- production migrations remain safe to deploy before application behavior uses
  the new tables

## Deferred Scope

The following are intentionally outside the MVP:

- global tag discovery
- public tag pages
- autocomplete and suggestions
- trending tags
- automatic hashtag parsing
- tag renaming
- tag administration or moderation
- reserved or prohibited tag names
- manual tag ordering
- deleting unused tag rows

## Implementation Sequence

Keep PRs centered on one independently reviewable concern. Reassess and split
before a PR approaches 10–15 changed files or 400–500 net lines.

### Phase 1: Establish Tag Storage

#### Phase 1-1: Add Tag Database Schema

Suggested branch:

```text
tags-phase-1-1-database-schema
```

Scope:

- create `tags` and `post_tags`
- add relational constraints, indexes, and cascading foreign keys
- regenerate `db/schema.rb`
- update database documentation

Expected size: 3–4 files.

#### Phase 1-2: Add Tag Models and Associations

Suggested branch:

```text
tags-phase-1-2-model-associations
```

Scope:

- add `Tag` and `PostTag`
- add post, tag, and join associations
- add normalization, format, length, and uniqueness validation
- test models, associations, normalization, and duplicate joins
- add fixtures where useful

Expected size: 6–8 files.

### Phase 2: Add Post Tag Write Support

#### Phase 2-1: Add Atomic Post Writer

Suggested branch:

```text
tags-phase-2-1-atomic-post-writer
```

Scope:

- add the shared post-writing service
- enforce normalization and the five-tag limit
- find or create reusable tags
- synchronize joins inside one transaction
- test successful writes, reuse, failures, rollbacks, empty tags, and edits

Expected size: 3–5 files.

#### Phase 2-2: Integrate Tags into Post Create and Update

Suggested branch:

```text
tags-phase-2-2-post-controller-integration
```

Scope:

- permit and extract `tags: []`
- use the post writer from create and update
- preserve authorization and existing behavior
- return tag and post validation errors consistently
- add controller coverage

Expected size: 3–5 files.

#### Phase 2-3: Serialize Post Tags

Suggested branch:

```text
tags-phase-2-3-post-tag-serialization
```

Scope:

- return alphabetized tag strings in post JSON
- keep show, create, update, and feed contracts consistent
- preload tags and protect against N+1 queries
- update serialization/controller tests and API documentation

Expected size: 3–6 files.

### Phase 3: Add Tag Form Controls

#### Phase 3-1: Build Shared TagInput

Suggested branch:

```text
tags-phase-3-1-shared-tag-input
```

Scope:

- add shared frontend tag constants
- build TagInput and removable chips
- implement draft commit and immediate validation
- implement pending state and accessibility behavior
- add isolated component tests and styles

Expected size: 4–6 files. Include a PR `UI` section.

#### Phase 3-2: Integrate Non-Media Post Forms

Suggested branch:

```text
tags-phase-3-2-non-media-post-forms
```

Scope:

- integrate text, quote, and link forms
- include tags in payloads
- reset tags after success
- preserve tag state after failures
- update non-media form tests

Expected size: 5–7 files.

#### Phase 3-3: Integrate Media Post Forms

Suggested branch:

```text
tags-phase-3-3-media-post-forms
```

Scope:

- integrate photo, audio, and video forms
- preserve existing URL and upload behavior
- serialize tag arrays correctly in FormData where required
- update media-form tests

Expected size: 5–7 files.

#### Phase 3-4: Integrate Post Editing

Suggested branch:

```text
tags-phase-3-4-edit-post-tags
```

Scope:

- initialize TagInput from returned post tags
- add, remove, and replace tags during edits
- preserve tags after failed edits
- update query cache behavior and edit-form tests

Expected size: 3–5 files.

### Phase 4: Display and Filter Tags

#### Phase 4-1: Display Post Tags

Suggested branch:

```text
tags-phase-4-1-display-post-tags
```

Scope:

- display tags beneath post content and above the footer
- add responsive wrapping and feed-item tests
- render tags as text until filtering is available

Expected size: 3–5 files. Include a PR `UI` section.

#### Phase 4-2: Add Backend Feed Filtering

Suggested branch:

```text
tags-phase-4-2-backend-feed-filtering
```

Scope:

- accept an optional tag in `FeedQuery`
- filter only the accessible feed scope
- calculate pagination after filtering
- handle absent, nonexistent, and malformed filters
- add query/controller tests and API documentation

Expected size: 4–6 files.

#### Phase 4-3: Add Frontend Filter Query Integration

Suggested branch:

```text
tags-phase-4-3-filter-query-integration
```

Scope:

- read `tag` from dashboard search parameters
- include the tag in the endpoint and React Query key
- reset infinite pagination when the tag changes
- preserve cache, reload, and browser-history behavior
- add query and routing tests

Expected size: 4–7 files.

#### Phase 4-4: Add Filtered Feed UI

Suggested branch:

```text
tags-phase-4-4-filtered-feed-ui
```

Scope:

- make displayed tags clickable
- add the filtered heading and clear-filter action
- add empty, loading, error, and retry states
- manage focus when filters change or clear
- add keyboard, behavior, and responsive coverage

Expected size: 5–8 files. Include a PR `UI` section.

### Phase 5: Verify and Close Out Tags

#### Phase 5-1: Verify and Document Tags

Scope:

- run full Rails and frontend suites and the production build
- smoke-test all creation forms and editing
- test filtered infinite pagination and browser history
- complete keyboard-only and responsive passes
- add representative demo tags
- update API, schema, smoke-check, and closeout documentation
- record deferred work

Keep this documentation-focused. Meaningful defects discovered during
verification should receive separate focused PRs.

## Definition of Done

- all post types can create and edit explicit validated tags
- post, tag, and join writes are atomic
- post responses return alphabetized normalized tag strings
- tags display accessibly and responsively on feed posts
- selecting a tag filters only the existing accessible feed
- filtered counts and infinite pagination are correct
- URL, reload, Back, Forward, and clear-filter behavior work
- existing untagged posts remain valid
- database cascades remove joins when posts are deleted
- Rails and frontend suites and the production build pass
- live keyboard and responsive smoke checks pass
- deferred discovery and tag-management work remains outside the MVP
