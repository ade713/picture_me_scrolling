# @recommended_users = User.all - user.followee_users

@users.each do |user|
# @recommended_users.each do |user|
  json.set! user.id do
    json.partial! 'user', user: user
  end
end
