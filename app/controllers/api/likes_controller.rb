class Api::LikesController < ApplicationController
  before_action :require_logged_in

  def create
    @post = Post.find_by(id: params[:post_id])
    return render json: ['Post not found'], status: :not_found unless @post

    @like = current_user.likes.build(post: @post)

    if @like.save
      render 'api/posts/show'
    else
      render json: @like.errors.full_messages, status: :unprocessable_entity
    end
  end

  def destroy
    @like = current_user.likes.find_by(post_id: params[:post_id])
    return render json: ['Like not found'], status: :not_found unless @like

    @post = @like.post

    if @like.destroy
      render 'api/posts/show'
    else
      render json: @like.errors.full_messages, status: :unprocessable_entity
    end
  end
end
