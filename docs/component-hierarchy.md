# Component Hierarchy

## AuthFormContainer
- AuthForm

## DashboardContainer
- FeedComponent
  - PostsItemComponent
- PostItemComponent
  - LikeComponent
  - TagComponent
- NavBarContainer

## PostFormContainer
- PostFormComponent


# Routes
Path                        | Component
----------------------------|---------------------
"/login"                    | "AuthFormContainer"
"/signup"                   | "AuthFormContainer"
"/dashboard"                | "DashboardContainer"   
"/dashboard/posts/:post_id" | "PostItemContainer"
"/posts/new/:type"          | "PostFormContainer"
