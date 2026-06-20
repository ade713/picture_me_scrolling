class Api::PostsController < ApplicationController
  before_action :require_logged_in

  def create
    @post = Post.new(post_params)
    @post.author_id = current_user.id

    if @post.save
      render "api/posts/show"
    else
      render json: ['Unable to create post, check title/caption input'], status: :unprocessable_entity
    end
  end

  def index
    render_feed
  end

  def show
    @post = Post.find_by(id: params[:id])
  end

  def update
    @post = current_user.posts.find_by(id: params[:id])

    if @post && @post.update(post_params)
      render "api/posts/show"
    else
      render json: ['Post must belong to user to edit'], status: :unprocessable_entity
    end
  end

  def destroy
    @post = current_user.posts.find_by(id: params[:id])

    if @post&.delete
      render "api/posts/show"
    else
      render json: ['Post must belong to user to delete'], status: :unprocessable_entity
    end
  end

  private

  def render_feed
    @posts, @pagination = paginated_feed_for(current_user)
  end

  def post_params
    params.require(:post).permit(:title, :body, :url, :image, :post_type)
  end
end
