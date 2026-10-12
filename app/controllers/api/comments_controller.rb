class Api::CommentsController < ApplicationController
  before_action :require_logged_in

  def index
    post = Post.find_by(id: params[:post_id])
    return render json: [Post::NOT_FOUND_ERROR], status: :not_found unless post

    @comments, @pagination, @reply_counts = PostCommentsQuery.call(
      post: post, after: params[:after], per_page: params[:per_page]
    )
  rescue PostCommentsQuery::InvalidCursorError => error
    render json: [error.message], status: :unprocessable_entity
  end
end
