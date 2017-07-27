json.extract! user, :id, :username, :avatar_url
json.avatar_url asset_path(user.avatar.url)
