class Api::LikesController < ApplicationController
  def create
    @like = Like.new
    @like.user_id = current_user.id
    @like.post_id = params[:post_id]

    @like.save!
    render json: "api/posts/show"
  end

  def destroy
    @like = current_user.likes.find_by(post_id: params[:post_id])
    @like.destroy
    render json: "api/posts/show"
  end
end
