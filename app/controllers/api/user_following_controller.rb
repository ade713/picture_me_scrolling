class Api::UserFollowingController < ApplicationController
  include UserRelationshipRendering

  before_action :require_logged_in

  def index
    user = User.find_by(id: params[:user_id])
    return render json: [User::NOT_FOUND_ERROR], status: :not_found unless user

    @users, @pagination = UserFollowingQuery.call(
      user: user,
      page: params[:page],
      per_page: params[:per_page]
    )
    load_followed_user_ids(@users)
    render 'api/user_relationships/index'
  end
end
