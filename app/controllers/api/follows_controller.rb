class Api::FollowsController < ApplicationController
  before_action :require_logged_in

  def create
    @follow = current_user.followees.build(followee_id: params[:user_id])

    if @follow.save
      render_feed
    else
      render json: @follow.errors.full_messages, status: :unprocessable_entity
    end
  end

  def destroy
    @follow = current_user.followees.find_by(followee_id: params[:user_id])

    if @follow&.destroy
      render_feed
    else
      render json: ['Follow relationship not found'], status: :not_found
    end
  end

  private

  def render_feed
    current_user.reload
    @posts = current_user.posts + current_user.followed_posts

    render 'api/posts/index'
  end
end
