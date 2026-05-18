json.extract! user, :id, :username
json.avatar_url user.avatar.attached? ? url_for(user.avatar) : nil

