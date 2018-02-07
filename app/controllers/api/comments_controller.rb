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

  def update
    @comment = current_user.comments.find_by(id: params[:id])
    @post = @comment.post

    if @comment && comment.update(comment_params)
      render 'api/posts/show'
    else
      render json: ['Comment must belong to user to edit'], status: 422
    end
  end

  def destroy
    @comment = current_user.comments.find_by_id(params[:id])
    @post = @comment.post

    if @comment.delete
      render 'api/posts/show'
    else
      render json: ['Unable to delete comment']
    end
  end

  private

  def comment_params
    params.require(:post).permit(:body, :post_id)
  end
end
