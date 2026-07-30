class Api::EmailVerificationsController < ApplicationController
  RESEND_SUCCESS_MESSAGE = 'Verification email sent'.freeze
  VERIFICATION_SUCCESS_MESSAGE = 'Email address verified'.freeze
  DELIVERY_FAILURE_MESSAGE =
    'Verification email could not be sent. Please try again.'.freeze
  EMAIL_REQUIRED_MESSAGE = 'Add an email address before requesting verification'.freeze
  ALREADY_VERIFIED_MESSAGE = 'Email address is already verified'.freeze
  SHARED_GUEST_MESSAGE =
    'Email verification is unavailable for the shared guest account'.freeze
  INVALID_TOKEN_MESSAGE = 'Verification link is invalid'.freeze
  EXPIRED_TOKEN_MESSAGE = 'Verification link has expired'.freeze

  before_action :require_logged_in, only: :create

  def create
    eligibility_error = resend_eligibility_error
    return render json: [eligibility_error], status: :unprocessable_entity if eligibility_error

    result = EmailVerificationSender.new(user: current_user).call

    if result.success?
      render json: { message: RESEND_SUCCESS_MESSAGE }
    else
      render json: [DELIVERY_FAILURE_MESSAGE], status: :service_unavailable
    end
  end

  def update
    result = EmailVerificationTokenConsumer.new(
      token: email_verification_params[:token]
    ).call

    if result.success?
      render json: { message: VERIFICATION_SUCCESS_MESSAGE }
    else
      render json: [token_error_message(result.error)],
             status: :unprocessable_entity
    end
  end

  private

  def email_verification_params
    params
      .fetch(:email_verification, ActionController::Parameters.new)
      .permit(:token)
  end

  def resend_eligibility_error
    return SHARED_GUEST_MESSAGE unless current_user.account_settings_enabled?
    return EMAIL_REQUIRED_MESSAGE if current_user.email.blank?
    return ALREADY_VERIFIED_MESSAGE if current_user.email_verified_at?
  end

  def token_error_message(error)
    return EXPIRED_TOKEN_MESSAGE if error == EmailVerificationTokenConsumer::EXPIRED_TOKEN_ERROR

    INVALID_TOKEN_MESSAGE
  end
end
