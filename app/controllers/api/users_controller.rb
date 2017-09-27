class Api::UsersController < ApplicationController
  def create
    @user = User.new(user_params)

    if @user.save
      login(@user)
      render '/api/users/show'
    else
      render json: @user.errors.full_messages, status: 422
    end
  end

  def index
    rec_users = User.all - current_user.followee_users - [current_user]
    @users = rec_users.take(6)
  end

  private

  def user_params
    params.require(:user).permit(:username, :password)
  end
end
