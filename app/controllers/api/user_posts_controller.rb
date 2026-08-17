class Api::UserPostsController < ApplicationController
  before_action :require_logged_in

  def index
    user = User.find_by(id: params[:user_id])
    return render json: [User::NOT_FOUND_ERROR], status: :not_found unless user

    @posts, @pagination = UserPostsQuery.call(
      user: user,
      page: params[:page],
      per_page: params[:per_page],
      tag: params[:tag]
    )
    prepare_post_rendering_context(@posts)
    render 'api/posts/index'
  rescue UserPostsQuery::InvalidTagError => error
    render json: [error.message], status: :unprocessable_entity
  end
end
