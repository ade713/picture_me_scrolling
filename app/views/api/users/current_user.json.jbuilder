json.partial! "api/users/user", user: @user
json.extract! @user, :email, :email_verified_at
