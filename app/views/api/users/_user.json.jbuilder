json.extract! user, :id, :username
json.avatar_url asset_path(user.avatar.url)
json.followees_count user.followee_users.count
json.followees user.followee_users
