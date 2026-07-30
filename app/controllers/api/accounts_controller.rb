class Api::AccountsController < ApplicationController
  before_action :require_logged_in
  before_action :require_account_settings_enabled

  def avatar
    result = AvatarUpdater.new(user: current_user, upload: params[:avatar]).call

    if result.success?
      @user = result.user
      render 'api/users/current_user'
    else
      render json: result.errors, status: :unprocessable_entity
    end
  end

  def email
    current_user.email = email_params[:email]

    if current_user.save(context: :email_update)
      EmailVerificationSender.new(user: current_user).call if current_user.saved_change_to_email?
      @user = current_user
      render 'api/users/current_user'
    else
      render json: current_user.errors.full_messages, status: :unprocessable_entity
    end
  end

  def password
    attributes = password_params

    unless current_user.is_password?(attributes[:current_password].to_s)
      return render json: ['Current password is incorrect'], status: :unprocessable_entity
    end

    new_password = attributes[:password].to_s
    confirmation = attributes[:password_confirmation].to_s

    if new_password != confirmation
      return render json: ["Password confirmation doesn't match password"],
                    status: :unprocessable_entity
    end

    current_user.password = new_password

    if current_user.save
      @user = current_user
      render 'api/users/current_user'
    else
      render json: current_user.errors.full_messages, status: :unprocessable_entity
    end
  end

  private

  def email_params
    params.fetch(:account, ActionController::Parameters.new).permit(:email)
  end

  def password_params
    params.fetch(:account, ActionController::Parameters.new).permit(
      :current_password,
      :password,
      :password_confirmation
    )
  end

  def require_account_settings_enabled
    return if current_user.account_settings_enabled?

    render json: ['Account settings are unavailable for the shared guest account'],
           status: :unprocessable_entity
  end
end
