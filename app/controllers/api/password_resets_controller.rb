class Api::PasswordResetsController < ApplicationController
  REQUEST_ACCEPTED_MESSAGE =
    'If that address belongs to a verified account, a reset link has been sent.'.freeze

  def create
    email = password_reset_params[:email]

    if PasswordResetRateLimiter.new(email: email, ip: request.remote_ip).allowed?
      user = eligible_user_for(email)
      PasswordResetSender.new(user: user).call if user
    end

    render json: { message: REQUEST_ACCEPTED_MESSAGE }, status: :accepted
  end

  private

  def eligible_user_for(email)
    normalized_email = User.normalize_value_for(:email, email)
    user = User.find_by(email: normalized_email)

    return unless user&.email_verified_at?
    return unless user.account_settings_enabled?

    user
  end

  def password_reset_params
    params
      .fetch(:password_reset, ActionController::Parameters.new)
      .permit(:email)
  end
end
