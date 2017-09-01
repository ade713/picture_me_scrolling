json.extract! user, :id, :username
json.avatar_url asset_path(user.avatar.url)
# json.recommended_users User.all - user.followee_users
