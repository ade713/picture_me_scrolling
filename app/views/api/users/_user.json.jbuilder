json.extract! user, :id, :username
json.avatar_url avatar_url_for(user)
json.account_settings_enabled user.account_settings_enabled?
