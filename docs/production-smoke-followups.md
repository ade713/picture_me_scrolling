# Production Smoke Follow-Ups

Track bugs and rough edges found during the first Render production smoke pass.
Keep this list focused on behavior that should be fixed before a broader release.

## Confirmed Working

- Normal login works in production.
- Guest login works after production seed data was added.
- Create, edit, and delete post flows complete successfully.
- Like and unlike flows work.
- Follow and unfollow users work.
- Recommended users update after follow/unfollow actions.
- Feed updates after follow/unfollow actions.
- Load more posts pagination works.
- Logout and session persistence after refresh work.
- Link post validation and rendering work in production.
- Video posts create and play through S3.
- Audio posts create and play through S3.
- Photo posts create and render through S3.

## Bugs / Buggy Behavior

## Addressed Follow-Ups

### Recommended User Follow Feed Coverage

Addressed by the recommended-user feed seed coverage PR by adding recent lightweight text, quote, and link posts for early recommended users. Those posts are created after performance seed posts so following recommended users should visibly update the guest feed near the top during smoke testing.

### Duplicate Post Submissions

Addressed in PR #100 by guarding create post submissions and edit modal saves while requests are pending. The Post and Save buttons now disable during in-flight requests, and repeated rapid clicks are blocked with a submit-handler guard.

### Duplicate Login Error Message

Addressed in PR #101 by deduping rendered auth errors and resetting login/signup mutation errors when switching between Log In and Sign Up modes. Invalid credentials now show one generic error message, and stale auth errors clear when the auth mode changes.

### Audio Post Player Spacing

Addressed in PR #102 by rendering audio posts with the native audio element and removing stale video-era sizing. Audio posts now sit closer to the author row, keep a small gap before the caption, and avoid excess empty space below the footer.

### Default Profile Image For New Users

Addressed in PR #103 by adding a shared default avatar fallback for user payloads and feed post author payloads. New profiles without uploaded avatars now render a default profile image, while uploaded avatars remain preferred when present.

## Remaining Production Smoke Checks

- None at this time.

## Follow-Up Candidate PRs

- Add production-safe demo seed task if manual production seeding becomes repetitive.
- Add Render production smoke checklist updates after the full smoke pass is complete.

## Future To-Dos After Issue Fixes

- Add profile/settings features so users can choose or update profile pictures/thumbnails. This could also include profile account management such as password updates.
- Add a small pop-up or modal confirmation with Yes/No actions after clicking delete post.
- Add hover indication for edit and highlight/like buttons so interactive controls feel clearer.
- Add accessible labels and lightweight custom tooltips for clickable icon actions, including follow, like/unlike, edit, delete, and social links where helpful.
