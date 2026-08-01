class Api::PasswordResetsController < ApplicationController
  REQUEST_ACCEPTED_MESSAGE =
    'If that address belongs to a verified account, a reset link has been sent.'.freeze
  RESET_SUCCESS_MESSAGE =
    'Password has been reset. Log in with your new password.'.freeze
  INVALID_TOKEN_MESSAGE = 'Password reset link is invalid'.freeze
  EXPIRED_TOKEN_MESSAGE = 'Password reset link has expired'.freeze

  def create
    email = password_reset_params[:email]

    if PasswordResetRateLimiter.new(email: email, ip: request.remote_ip).allowed?
      user = eligible_user_for(email)
      PasswordResetSender.new(user: user).call if user
    end

    render json: { message: REQUEST_ACCEPTED_MESSAGE }, status: :accepted
  end

  def update
    result = PasswordResetTokenConsumer.new(**password_reset_attributes).call

    if result.success?
      reset_session
      render json: { message: RESET_SUCCESS_MESSAGE }
    else
      render_reset_error(result)
    end
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

  def password_reset_attributes
    params
      .fetch(:password_reset, ActionController::Parameters.new)
      .permit(:token, :password, :password_confirmation)
      .to_h
      .symbolize_keys
  end

  def render_reset_error(result)
    errors = case result.error
             when PasswordResetTokenConsumer::EXPIRED_TOKEN_ERROR
               [EXPIRED_TOKEN_MESSAGE]
             when PasswordResetTokenConsumer::VALIDATION_ERROR
               result.errors
             else
               [INVALID_TOKEN_MESSAGE]
             end

    render json: errors, status: :unprocessable_entity
  end
end
