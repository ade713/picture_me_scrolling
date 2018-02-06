class Api::CommentsController < ApplicationController
  def create
    @comment = Comment.new(comment_params)
    @comment.author_id = current_user.id
    @comment.post_id = params[:post_id]
    @post = @comment.post

    if @comment.save
      render 'api/posts/show'
    else
      render json: ['Unable to comment on post'], status: 422
    end
  end

  def index
  end

  def update
  end

  def destroy
  end

  private

  def comment_params
    params.require(:post).permit(:body)
  end
end
