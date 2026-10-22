class Api::CommentRepliesController < ApplicationController
  before_action :require_logged_in
  before_action :load_parent

  def index
    @comments, @pagination = CommentRepliesQuery.call(
      parent: @parent, before: params[:before], per_page: params[:per_page]
    )
    @reply_counts = {} # Replies cannot have children.
    render 'api/comments/index'
  rescue CommentRepliesQuery::InvalidCursorError => error
    render json: [error.message], status: :unprocessable_entity
  end

  def create
    @comment = @parent.replies.build(comment_params)
    @comment.post = @parent.post
    @comment.user = current_user

    if @comment.save
      render 'api/comments/show', status: :created
    else
      render json: @comment.errors.full_messages, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render_comment_not_found
  end

  private

  def comment_params
    params.require(:comment).permit(:body)
  end

  def load_parent
    @parent = Comment.where(parent_id: nil).find_by(id: params[:comment_id])
    render_comment_not_found unless @parent
  end

  def render_comment_not_found
    render json: [Comment::NOT_FOUND_ERROR], status: :not_found
  end
end
