# Picture Me Scrolling (PicMeS)

**Heroku Link**
**Trello Link**

## Minimum Viable Products (MVP)

Picture Me Scrolling is a single page application developed to provide users with single location to sit back and experience the expression of others through words, sounds and visions. Tumblr served as the inspiration for this application that is supported a Ruby on Rails and React/Redux.

1. User Authentication
    + Account creation
    + Login/Logout
    + Guest/demo login/logout
2. Production README
3. Hosting on Heroku
4. Posts form for various post types
    + Types include:
      + pics (static, gifs)
      + text/blog posts
      + links
5. Feed
    + Will display a list of posts from users that primary user follows
6. Follow
    + Add/view posts of another user on primary user's feed
7. Likes
    + Allows primary user to like posts on the user's feed
8. Bonus Features
    + Tags
       + Short descriptions to identify a post's themes
    + User show page (blog)
       + Displays a user's posts
    + Reblog
       + Enables primary user to share another user's post
    + Comments
       + Short notes relating to the respective post

NB: All feature MVPs will have the following:
    + Adequate and appropriate styling
    + Smooth, bug-free navigation
    + Adequate and appropriate seeds to demonstrate feature

## Design Documents

* [API Endpoints][api-endpoints]
* [Component Hierarchy][component-hierarchy]
* [Sample State][sample-state]
* [Database Schema][db-schema]

[api-endpoints]: ./api-endpoints.md
[component-hierarchy]: ./component-hierarchy.md
[db-schema]: ./db-schema.md
[sample-state]: ./sample-state.md

## Implementation Timeline

### Phase 1: Backend Setup and Front End User Authentication (2 Days)
**Target:** Functional Rails back-end with React/Redux front-end authentication.
            User can sign up, login and logout.
            Guest user will be created to provide demo of the site's features.

## Phase 2: Feed/Posts Models, API, and Components (3 Days)
**Target:** User has a feed which is comprised of posts by followed users.
            Posts are created, displayed, edited, and deleted by user.
            Feed and posts are presented via components.

## Phase 3: Follows (1 Day)
**Target:** User can follow other users.
            Followed users' posts appear on primary user's feed.

## Phase 4: Likes (1 Day)
**Target:** User can like/unlike other users' posts.
            Total likes are displayed below respective post.

## Phase 5: Tags (1 Day)
**Target:** User can add/remove tags to posts.
            Tags are displayed below respective post.

## Phase 6: User Testing, Bonus Features (1 Day)
**Target:** Put website through beta testing to get feedback.
            Polish website accordingly.
            Add bonus features if time permits.
