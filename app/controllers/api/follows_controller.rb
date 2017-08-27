class Api::FollowsController < ApplicationController
  def create
    @follow = Follow.new
    @follow.follower_id = current_user.id
    @follow.followee_id = params[:user_id]

    @follow.save!
    render json: "api/posts/show"
  end

  def index
    @follows = current_user.follows
  end

  def destroy
    @follow = current_user.follows.find_by(followee_id: params[:user_id])
    @follow.destroy
    render json: "api/posts/show"
  end

  private

  def follow_params
    params.require(:follow).permit(:followee_id, :follower_id)
  end
end
