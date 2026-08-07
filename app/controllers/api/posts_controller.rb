class Api::PostsController < ApplicationController
  before_action :require_logged_in

  def create
    @post = current_user.posts.build
    result = write_post(@post)

    if result.success?
      render "api/posts/show"
    else
      render json: result.errors, status: :unprocessable_entity
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

    unless @post
      render json: ['Post must belong to user to edit'], status: :unprocessable_entity
      return
    end

    result = write_post(@post)

    if result.success?
      render "api/posts/show"
    else
      render json: result.errors, status: :unprocessable_entity
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
    @posts, @pagination = FeedQuery.call(
      user: current_user,
      page: params[:page],
      per_page: params[:per_page]
    )
    prepare_post_rendering_context(@posts)
  end

  def post_params
    params.require(:post).permit(:title, :body, :url, :image, :post_type, tags: [])
  end

  def write_post(post)
    attributes = post_params
    tag_names = attributes.delete(:tags)

    PostWriter.new(post: post, attributes: attributes, tag_names: tag_names).call
  end
end
