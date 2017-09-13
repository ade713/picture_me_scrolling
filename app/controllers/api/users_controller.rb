class Api::UsersController < ApplicationController
  def create
    @user = User.new(user_params)

    if @user.save
      login(@user)
      render "/api/users/show"
    else
      render json: @user.errors.full_messages, status: 422
    end
  end

  def index

    # @users = User.joins(:posts).uniq
    @users = User.all - current_user.followee_users - current_user
  end

  private

  def user_params
    params.require(:user).permit(:username, :password)
  end
end
