module UserRelationshipRendering
  private

  def load_followed_user_ids(users)
    user_ids = users.map(&:id)

    @followed_user_ids = current_user.followees
                                     .where(followee_id: user_ids)
                                     .pluck(:followee_id)
  end
end
