if @users.empty?
  json.users({})
else
  json.users do
    @users.each do |user|
      json.set! user.id do
        json.partial! 'api/users/user', user: user
        followed_by_current_user = user.id != current_user.id &&
                                   @followed_user_ids.include?(user.id)
        json.followed_by_current_user followed_by_current_user
      end
    end
  end
end

json.user_ids @users.map(&:id)

json.pagination do
  json.extract! @pagination, :page, :per_page, :total_count, :total_pages, :has_more
end
