class Api::FollowsController < ApplicationController
  def create
    @follow = Follow.new
    @follow.follower_id = current_user.id
    @follow.followee_id = params[:user_id]
    @posts = current_user.posts + current_user.followed_posts

    @follow.save!
    render 'api/posts/index'
  end

  def destroy
    @follow = current_user.followees.find_by(followee_id: params[:user_id])
    @posts = current_user.posts + current_user.followed_posts

    @follow.destroy
    render 'api/posts/index'
  end

  private

  def follow_params
    params.require(:follow).permit(:followee_id, :follower_id)
  end
end
