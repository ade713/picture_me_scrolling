class Api::FollowsController < ApplicationController
  def create
    @follow = Follow.new
    @follow.follower_id = current_user.id
    @follow.followee_id = params[:user_id]
    @author = User.find_by(id: @follow.followee_id)
    @posts = @posts = Post.find_by_sql([
            'SELECT posts.*
            FROM posts
            LEFT JOIN users ON posts.author_id = users.id
            LEFT JOIN follows ON users.id = follows.followee_id
            WHERE posts.author_id = follows.followee_id AND follows.follower_id = ?',
            current_user
          ])

    @follow.save!
    render 'api/posts/index'
  end

  def destroy
    @follow = current_user.followees.find_by(followee_id: params[:user_id])
    # @author = User.find_by(id: @follow.followee_id)
    # @posts = @author.posts
    @posts = Post.find_by_sql([
            'SELECT posts.*
            FROM posts
            LEFT JOIN users ON posts.author_id = users.id
            LEFT JOIN follows ON users.id = follows.followee_id
            WHERE posts.author_id = follows.followee_id AND follows.follower_id = ?',
            current_user
          ])

    @follow.destroy
    render 'api/posts/index'
  end

  private

  def follow_params
    params.require(:follow).permit(:followee_id, :follower_id)
  end
end
