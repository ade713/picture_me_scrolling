json.partial! "api/users/user", user: @user
json.follower_count @follower_count
json.following_count @following_count
json.followed_by_current_user @followed_by_current_user
