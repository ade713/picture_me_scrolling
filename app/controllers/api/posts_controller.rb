class Api::PostsController < ApplicationController
  def create
    @post.author_id = @current_user.id
    @post = Post.new(post_params)

    if @post.save
      render "api/posts/show"
    else
      render json: @post.errors.full_messages, status: 422
    end
  end

  def index
    @posts = Post.all
  end

  def show
    @post = Post.find(params[:id])
  end

  def update
    @post = current_user.posts.find(params[:id])

    if @post.update(post_params)
      render "api/posts/show"
    else
      render json: ["Posts must belong to user to edit"]
    end
  end

  def destroy
    @post = current_user.posts.find(params[:id])

    if @post.delete
      render "api/posts/show"
    else
      render json: ["Posts must belong to user to delete"]
    end
  end

  private

  def post_params
    params.require(:posts).permit(:title, :body, :url, :likes_count, :author_id)
  end
end