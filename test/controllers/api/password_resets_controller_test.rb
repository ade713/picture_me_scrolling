require 'test_helper'
require 'minitest/mock'

class Api::PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    PasswordResetToken.delete_all
    User.delete_all
    ActionMailer::Base.deliveries.clear
    Rails.cache.delete_matched(
      "#{PasswordResetRateLimiter::CACHE_NAMESPACE}:*"
    )

    @user = create_user(
      'reset_request_user',
      email: 'reset-request@example.com',
      verified: true
    )
  end

  test 'public request normalizes the email and delivers a reset link' do
    assert_difference('PasswordResetToken.count', 1) do
      assert_difference('ActionMailer::Base.deliveries.size', 1) do
        request_reset(' RESET-REQUEST@EXAMPLE.COM ')
      end
    end

    assert_response :accepted
    assert_equal accepted_response, response_json
    assert_equal ['reset-request@example.com'], ActionMailer::Base.deliveries.last.to
  end

  test 'returns the same response without delivery for ineligible addresses' do
    unverified_user = create_user(
      'unverified_reset_request',
      email: 'unverified-request@example.com'
    )
    guest = create_user(
      User::SHARED_GUEST_USERNAME,
      email: 'guest-request@example.com',
      verified: true
    )

    [
      'missing@example.com',
      unverified_user.email,
      guest.email,
      nil
    ].each do |email|
      request_reset(email)

      assert_response :accepted
      assert_equal accepted_response, response_json
    end

    assert_equal 0, PasswordResetToken.count
    assert_empty ActionMailer::Base.deliveries
  end

  test 'returns the accepted response without delivery when rate limited' do
    denied_limiter = Object.new
    denied_limiter.define_singleton_method(:allowed?) { false }

    PasswordResetRateLimiter.stub(:new, denied_limiter) do
      request_reset(@user.email)
    end

    assert_response :accepted
    assert_equal accepted_response, response_json
    assert_equal 0, PasswordResetToken.count
    assert_empty ActionMailer::Base.deliveries
  end

  test 'does not expose synchronous delivery failures' do
    failed_sender = Object.new
    failed_sender.define_singleton_method(:call) do
      PasswordResetSender::Result.new(error: PasswordResetSender::DELIVERY_ERROR)
    end

    PasswordResetSender.stub(:new, ->(**_args) { failed_sender }) do
      request_reset(@user.email)
    end

    assert_response :accepted
    assert_equal accepted_response, response_json
  end

  test 'reset updates the password, consumes the token, and clears the session' do
    login_as(@user)
    issued_token = PasswordResetTokenIssuer.new(user: @user).call

    patch_reset(issued_token.raw_token)

    assert_response :success
    assert_equal Api::PasswordResetsController::RESET_SUCCESS_MESSAGE,
                 response_json['message']
    assert @user.reload.is_password?('new-password')
    refute PasswordResetToken.exists?(issued_token.password_reset_token.id)

    get api_users_url
    assert_response :unauthorized
  end

  test 'reset returns validation errors and retains the token' do
    issued_token = PasswordResetTokenIssuer.new(user: @user).call

    patch_reset(
      issued_token.raw_token,
      password: 'short',
      password_confirmation: 'different-password'
    )

    assert_response :unprocessable_entity
    assert_equal [PasswordResetTokenConsumer::CONFIRMATION_ERROR], response_json
    assert @user.reload.is_password?('password')
    assert PasswordResetToken.exists?(issued_token.password_reset_token.id)

    patch_reset(
      issued_token.raw_token,
      password: 'short',
      password_confirmation: 'short'
    )

    assert_response :unprocessable_entity
    assert_includes response_json, 'Password is too short (minimum is 6 characters)'
    assert PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  test 'reset handles missing request fields without raising an error' do
    patch api_password_reset_url

    assert_response :unprocessable_entity
    assert_equal [Api::PasswordResetsController::INVALID_TOKEN_MESSAGE],
                 response_json

    issued_token = PasswordResetTokenIssuer.new(user: @user).call
    patch api_password_reset_url, params: {
      password_reset: { token: issued_token.raw_token }
    }

    assert_response :unprocessable_entity
    assert_includes response_json, 'Password is too short (minimum is 6 characters)'
    assert @user.reload.is_password?('password')
    assert PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  test 'reset distinguishes expired and invalid links' do
    expired_token = PasswordResetTokenIssuer.new(
      user: @user,
      current_time: PasswordResetTokenIssuer::LIFETIME.ago
    ).call

    patch_reset(expired_token.raw_token)

    assert_response :unprocessable_entity
    assert_equal [Api::PasswordResetsController::EXPIRED_TOKEN_MESSAGE],
                 response_json

    patch_reset('invalid-token')

    assert_response :unprocessable_entity
    assert_equal [Api::PasswordResetsController::INVALID_TOKEN_MESSAGE],
                 response_json
  end

  test 'reset rejects used and superseded links' do
    used_token = PasswordResetTokenIssuer.new(user: @user).call
    patch_reset(used_token.raw_token)
    assert_response :success

    patch_reset(used_token.raw_token)
    assert_response :unprocessable_entity
    assert_equal [Api::PasswordResetsController::INVALID_TOKEN_MESSAGE],
                 response_json

    superseded_token = PasswordResetTokenIssuer.new(user: @user).call
    current_token = PasswordResetTokenIssuer.new(user: @user).call

    patch_reset(superseded_token.raw_token)

    assert_response :unprocessable_entity
    assert_equal [Api::PasswordResetsController::INVALID_TOKEN_MESSAGE],
                 response_json
    assert PasswordResetToken.find_by_raw_token(current_token.raw_token)
  end

  private

  def accepted_response
    {
      'message' =>
        'If that address belongs to a verified account, a reset link has been sent.'
    }
  end

  def create_user(username, email:, verified: false)
    user = User.create!(
      username: username,
      email: email,
      password: 'password'
    )
    user.update!(email_verified_at: Time.current) if verified
    user
  end

  def request_reset(email)
    post api_password_reset_url, params: {
      password_reset: { email: email }
    }
  end

  def patch_reset(
    token,
    password: 'new-password',
    password_confirmation: 'new-password'
  )
    patch api_password_reset_url, params: {
      password_reset: {
        token: token,
        password: password,
        password_confirmation: password_confirmation
      }
    }
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
