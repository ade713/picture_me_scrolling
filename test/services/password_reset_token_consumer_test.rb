require 'test_helper'

class PasswordResetTokenConsumerTest < ActiveSupport::TestCase
  setup do
    PasswordResetToken.delete_all
    User.delete_all

    @current_time = Time.zone.parse('2026-08-01 12:00:00')
    @user = User.create!(
      username: 'reset_consumer_user',
      email: 'reset-consumer@example.com',
      password: 'old-password'
    )
    @user.update_column(:email_verified_at, @current_time)
  end

  test 'updates the password, rotates sessions, and deletes the token atomically' do
    issued_token = issue_token
    original_session_token = @user.session_token

    result = consume(issued_token.raw_token)

    assert result.success?
    assert_equal @user, result.user
    assert @user.reload.is_password?('new-password')
    refute @user.is_password?('old-password')
    refute_equal original_session_token, @user.session_token
    refute PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  test 'rejects an invalid token without changing the user' do
    issued_token = issue_token
    original_session_token = @user.session_token

    result = consume('invalid-token')

    refute result.success?
    assert_equal PasswordResetTokenConsumer::INVALID_TOKEN_ERROR, result.error
    assert @user.reload.is_password?('old-password')
    assert_equal original_session_token, @user.session_token
    assert PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  test 'deletes an expired token without changing the user' do
    issued_token = issue_token(
      current_time: @current_time - PasswordResetTokenIssuer::LIFETIME
    )
    original_session_token = @user.session_token

    result = consume(issued_token.raw_token)

    refute result.success?
    assert_equal PasswordResetTokenConsumer::EXPIRED_TOKEN_ERROR, result.error
    assert @user.reload.is_password?('old-password')
    assert_equal original_session_token, @user.session_token
    refute PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  test 'rejects a token superseded by a newer issue' do
    first_token = issue_token
    second_token = issue_token(current_time: @current_time + 1.minute)

    result = consume(first_token.raw_token)

    refute result.success?
    assert_equal PasswordResetTokenConsumer::INVALID_TOKEN_ERROR, result.error
    assert @user.reload.is_password?('old-password')
    assert_equal second_token.password_reset_token,
                 PasswordResetToken.find_by_raw_token(second_token.raw_token)
  end

  test 'retains the token when confirmation does not match' do
    issued_token = issue_token

    result = consume(
      issued_token.raw_token,
      password_confirmation: 'different-password'
    )

    refute result.success?
    assert_equal PasswordResetTokenConsumer::VALIDATION_ERROR, result.error
    assert_equal [PasswordResetTokenConsumer::CONFIRMATION_ERROR], result.errors
    assert @user.reload.is_password?('old-password')
    assert PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  test 'retains the token when the password is invalid' do
    issued_token = issue_token

    result = consume(
      issued_token.raw_token,
      password: 'short',
      password_confirmation: 'short'
    )

    refute result.success?
    assert_equal PasswordResetTokenConsumer::VALIDATION_ERROR, result.error
    assert_includes result.errors, 'Password is too short (minimum is 6 characters)'
    assert @user.reload.is_password?('old-password')
    assert PasswordResetToken.exists?(issued_token.password_reset_token.id)
  end

  private

  def consume(
    token,
    password: 'new-password',
    password_confirmation: 'new-password'
  )
    PasswordResetTokenConsumer.new(
      token: token,
      password: password,
      password_confirmation: password_confirmation,
      current_time: @current_time
    ).call
  end

  def issue_token(current_time: @current_time)
    PasswordResetTokenIssuer.new(
      user: @user,
      current_time: current_time
    ).call
  end
end
