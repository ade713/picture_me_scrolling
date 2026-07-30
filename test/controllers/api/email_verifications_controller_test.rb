require 'test_helper'
require 'minitest/mock'

class Api::EmailVerificationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    EmailVerificationToken.delete_all
    User.delete_all
    ActionMailer::Base.deliveries.clear

    @user = User.create!(
      username: 'verification_api_user',
      email: 'verification@example.com',
      password: 'password'
    )
  end

  test 'resend requires an authenticated session' do
    post api_email_verification_url

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'resend replaces the token and delivers another email' do
    original_token = EmailVerificationTokenIssuer.new(user: @user).call
    original_digest = original_token.verification_token.token_digest
    login_as(@user)

    assert_no_difference('EmailVerificationToken.count') do
      assert_difference('ActionMailer::Base.deliveries.size', 1) do
        post api_email_verification_url
      end
    end

    assert_response :success
    assert_equal(
      Api::EmailVerificationsController::RESEND_SUCCESS_MESSAGE,
      response_json['message']
    )
    refute_equal original_digest,
                 @user.reload.email_verification_token.token_digest
  end

  test 'resend rejects ineligible accounts without issuing a token' do
    verified_user = create_user(
      'verified_user',
      email: 'verified@example.com'
    )
    verified_user.update_column(:email_verified_at, Time.current)
    legacy_user = create_user('legacy_user')
    guest = create_user(
      User::SHARED_GUEST_USERNAME,
      email: 'guest@example.com'
    )

    [
      [verified_user, Api::EmailVerificationsController::ALREADY_VERIFIED_MESSAGE],
      [legacy_user, Api::EmailVerificationsController::EMAIL_REQUIRED_MESSAGE],
      [guest, Api::EmailVerificationsController::SHARED_GUEST_MESSAGE]
    ].each do |user, expected_message|
      login_as(user)
      post api_email_verification_url

      assert_response :unprocessable_entity
      assert_equal [expected_message], response_json
    end

    assert_equal 0, EmailVerificationToken.count
    assert_empty ActionMailer::Base.deliveries
  end

  test 'resend reports a synchronous delivery failure' do
    failed_sender = Object.new
    failed_sender.define_singleton_method(:call) do
      EmailVerificationSender::Result.new(
        error: EmailVerificationSender::DELIVERY_ERROR
      )
    end
    login_as(@user)

    EmailVerificationSender.stub(:new, ->(**_args) { failed_sender }) do
      post api_email_verification_url
    end

    assert_response :service_unavailable
    assert_equal(
      [Api::EmailVerificationsController::DELIVERY_FAILURE_MESSAGE],
      response_json
    )
  end

  test 'verification is public and consumes a valid token' do
    issued_token = EmailVerificationTokenIssuer.new(user: @user).call

    patch api_email_verification_url, params: {
      email_verification: { token: issued_token.raw_token }
    }

    assert_response :success
    assert_equal(
      Api::EmailVerificationsController::VERIFICATION_SUCCESS_MESSAGE,
      response_json['message']
    )
    assert @user.reload.email_verified_at?
    refute EmailVerificationToken.exists?(issued_token.verification_token.id)
  end

  test 'verification distinguishes expired and invalid links' do
    expired_token = EmailVerificationTokenIssuer.new(
      user: @user,
      current_time: 25.hours.ago
    ).call

    patch api_email_verification_url, params: {
      email_verification: { token: expired_token.raw_token }
    }

    assert_response :unprocessable_entity
    assert_equal(
      [Api::EmailVerificationsController::EXPIRED_TOKEN_MESSAGE],
      response_json
    )

    patch api_email_verification_url, params: {
      email_verification: { token: 'invalid-token' }
    }

    assert_response :unprocessable_entity
    assert_equal(
      [Api::EmailVerificationsController::INVALID_TOKEN_MESSAGE],
      response_json
    )
  end

  private

  def create_user(username, email: nil)
    User.create!(
      username: username,
      email: email,
      password: 'password'
    )
  end

  def login_as(user)
    post api_session_url, params: {
      user: {
        username: user.username,
        password: 'password'
      }
    }
  end

  def response_json
    JSON.parse(response.body)
  end
end
