json.partial! "api/users/user", user: user
json.extract! user, :email, :email_verified_at
json.account_settings_enabled user.account_settings_enabled?
