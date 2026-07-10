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

### Recommended User Follow Feed Coverage

Production/demo seed data should include posts authored by recommended users so following a recommended user visibly changes the feed. This can likely be addressed in `db/seeds.rb` by ensuring each recommended/demo user has at least one recent post that is not already visible to the guest before follow.

Recommended fix:

- Add or verify seeded posts for recommended users.
- Make sure at least some recommended-user posts are outside the guest feed until the user is followed.
- Re-run the production follow/unfollow smoke check after seeding.

### Default Profile Image For New Users

Newly created profiles should have a default avatar/profile image when the user has not uploaded one. This keeps recommended users, feed items, and account surfaces from showing broken or empty avatar states in production.

Recommended fix:

- Add a default avatar fallback in the user JSON/view layer or Active Storage URL helper.
- Confirm newly signed-up users render with the fallback image in recommended users and feed items.
- Keep uploaded avatars preferred over the default image.

### Audio Post Player Spacing

Audio posts have too much empty vertical space above the audio player bar, making the post card feel unbalanced. The audio body layout should reduce the top spacing while keeping the player, caption, likes, and owner controls readable.

Recommended fix:

- Adjust audio post body spacing so the player sits closer to the author row.
- Confirm spacing still works for captions, owner controls, and responsive feed widths.
- Keep media controls usable on desktop and mobile.

### Duplicate Login Error Message

Entering both an invalid username and invalid password currently displays the same login error twice. The auth form should show one `Invalid username or password` message whether one credential is wrong or both are wrong. The same auth error also stays visible when switching between Log In and Sign Up, so mode changes should clear stale auth errors.

Recommended fix:

- Dedupe repeated auth errors before rendering them in the auth form.
- Confirm invalid username, invalid password, and both-invalid cases each render a single visible error.
- Keep the generic error wording so the app does not reveal which credential was wrong.
- Clear stale auth errors when switching between Log In and Sign Up modes.

## Addressed Follow-Ups

### Duplicate Post Submissions

Addressed in PR #100 by guarding create post submissions and edit modal saves while requests are pending. The Post and Save buttons now disable during in-flight requests, and repeated rapid clicks are blocked with a submit-handler guard.

## Remaining Production Smoke Checks

- None at this time.

## Follow-Up Candidate PRs

- Dedupe repeated auth/login errors so invalid credentials show one message.
- Clear stale auth errors when toggling between Log In and Sign Up.
- Add recommended-user seed posts that visibly prove follow-driven feed updates.
- Add a default profile image fallback for users without uploaded avatars.
- Tighten excess spacing above audio players in audio post cards.
- Add production-safe demo seed task if manual production seeding becomes repetitive.
- Add Render production smoke checklist updates after the full smoke pass is complete.

## Future To-Dos After Issue Fixes

- Add profile/settings features so users can choose or update profile pictures/thumbnails. This could also include profile account management such as password updates.
- Add a small pop-up or modal confirmation with Yes/No actions after clicking delete post.
- Add hover indication for edit and highlight/like buttons so interactive controls feel clearer.
- Add accessible labels and lightweight custom tooltips for clickable icon actions, including follow, like/unlike, edit, delete, and social links where helpful.
