class Api::UserFollowersController < ApplicationController
  before_action :require_logged_in

  def index
    user = User.find_by(id: params[:user_id])
    return render json: [User::NOT_FOUND_ERROR], status: :not_found unless user

    @users, @pagination = UserFollowersQuery.call(
      user: user,
      page: params[:page],
      per_page: params[:per_page]
    )
    load_followed_user_ids(@users)
    render 'api/user_relationships/index'
  end

  private

  def load_followed_user_ids(users)
    user_ids = users.map(&:id)

    @followed_user_ids = current_user.followees
                                     .where(followee_id: user_ids)
                                     .pluck(:followee_id)
  end
end
