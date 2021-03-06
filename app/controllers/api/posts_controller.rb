class Api::PostsController < ApplicationController
  def create
    @post = Post.new(post_params)
    @post.author_id = current_user.id

    if @post.save
      render "api/posts/show"
    else
      render json: ['Unable to create post, check title/caption input'], status: 422
    end
  end

  def index
    # @posts = Post.all

    @posts = current_user.posts + current_user.followed_posts
  end

  def show
    @post = Post.find_by(id: params[:id])
  end

  def update
    @post = current_user.posts.find_by(id: params[:id])

    if @post && @post.update(post_params)
      render "api/posts/show"
    else
      render json: ['Post must belong to user to edit'], status: 422
    end
  end

  def destroy
    @post = current_user.posts.find_by(id: params[:id])

    if @post.delete
      render "api/posts/show"
    else
      render json: ['Post must belong to user to delete'], status: 422
    end
  end

  private

  def post_params
    params.require(:post).permit(:title, :body, :url, :image, :post_type)
  end
end
