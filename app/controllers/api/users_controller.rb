class Api::UsersController < ApplicationController
  before_action :require_logged_in, only: [:index, :show]

  def create
    @user = User.new(user_params)

    if @user.save(context: :signup)
      login(@user)
      EmailVerificationSender.new(user: @user).call
      render "api/users/current_user"
    else
      render json: @user.errors.full_messages, status: :unprocessable_entity
    end
  end

  def index
    @users = current_user.recommended_follow_users
  end

  def show
    @user = User.find(params[:id])
  end

  private

  def user_params
    params.require(:user).permit(:username, :email, :password)
  end
end
