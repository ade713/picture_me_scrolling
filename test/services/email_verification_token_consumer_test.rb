require 'test_helper'

class EmailVerificationTokenConsumerTest < ActiveSupport::TestCase
  setup do
    EmailVerificationToken.delete_all
    User.delete_all

    @current_time = Time.zone.parse('2026-07-28 12:00:00')
    @user = User.create!(
      username: 'consumer_user',
      email: 'consumer@example.com',
      password: 'password'
    )
  end

  test 'verifies the email and deletes the consumed token atomically' do
    issued_token = issue_token

    result = consume(issued_token.raw_token)

    assert result.success?
    assert_equal @user, result.user
    assert_equal @current_time, @user.reload.email_verified_at
    refute EmailVerificationToken.exists?(issued_token.verification_token.id)
  end

  test 'rejects an invalid token without changing the user' do
    issue_token

    result = consume('invalid-token')

    refute result.success?
    assert_equal EmailVerificationTokenConsumer::INVALID_TOKEN_ERROR,
                 result.error
    assert_nil @user.reload.email_verified_at
    assert_equal 1, EmailVerificationToken.count
  end

  test 'deletes an expired token without verifying the email' do
    issued_token = issue_token(
      current_time: @current_time - EmailVerificationTokenIssuer::LIFETIME
    )

    result = consume(issued_token.raw_token)

    refute result.success?
    assert_equal EmailVerificationTokenConsumer::EXPIRED_TOKEN_ERROR,
                 result.error
    assert_nil @user.reload.email_verified_at
    refute EmailVerificationToken.exists?(issued_token.verification_token.id)
  end

  test 'rejects a token superseded by a newer issue' do
    first_token = issue_token
    second_token = issue_token(current_time: @current_time + 1.hour)

    old_result = consume(first_token.raw_token)
    new_result = consume(
      second_token.raw_token,
      current_time: @current_time + 1.hour
    )

    refute old_result.success?
    assert_equal EmailVerificationTokenConsumer::INVALID_TOKEN_ERROR,
                 old_result.error
    assert new_result.success?
  end

  private

  def consume(token, current_time: @current_time)
    EmailVerificationTokenConsumer.new(
      token: token,
      current_time: current_time
    ).call
  end

  def issue_token(current_time: @current_time)
    EmailVerificationTokenIssuer.new(
      user: @user,
      current_time: current_time
    ).call
  end
end
