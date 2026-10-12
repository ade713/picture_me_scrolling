class Api::CommentsController < ApplicationController
  before_action :require_logged_in
  before_action :load_post

  def index
    @comments, @pagination, @reply_counts = PostCommentsQuery.call(
      post: @post, after: params[:after], per_page: params[:per_page]
    )
  rescue PostCommentsQuery::InvalidCursorError => error
    render json: [error.message], status: :unprocessable_entity
  end

  def create
    @comment = @post.comments.build(comment_params)
    @comment.user = current_user

    if @comment.save
      render :show, status: :created
    else
      render json: @comment.errors.full_messages, status: :unprocessable_entity
    end
  end

  private

  def load_post
    @post = Post.find_by(id: params[:post_id])
    render json: [Post::NOT_FOUND_ERROR], status: :not_found unless @post
  end

  def comment_params
    params.require(:comment).permit(:body)
  end
end
