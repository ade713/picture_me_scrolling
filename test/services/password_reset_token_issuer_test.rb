require 'test_helper'

class PasswordResetTokenIssuerTest < ActiveSupport::TestCase
  setup do
    PasswordResetToken.delete_all
    User.delete_all

    @current_time = Time.zone.parse('2026-07-30 12:00:00')
    @user = create_user(
      'reset_issuer_user',
      email: 'reset-issuer@example.com',
      verified: true
    )
  end

  test 'issues a raw token while storing only its digest' do
    result = issue_token
    reset_token = result.password_reset_token

    assert result.raw_token.present?
    refute_equal result.raw_token, reset_token.token_digest
    assert_equal(
      PasswordResetToken.digest(result.raw_token),
      reset_token.token_digest
    )
    assert_equal(
      @current_time + PasswordResetTokenIssuer::LIFETIME,
      reset_token.expires_at
    )
  end

  test 'replaces the existing token without adding another row' do
    first_result = issue_token

    assert_no_difference('PasswordResetToken.count') do
      second_result = issue_token(current_time: @current_time + 5.minutes)

      assert_equal(
        first_result.password_reset_token.id,
        second_result.password_reset_token.id
      )
      refute_equal first_result.raw_token, second_result.raw_token
      refute_equal(
        PasswordResetToken.digest(first_result.raw_token),
        second_result.password_reset_token.token_digest
      )
    end
  end

  test 'prunes only expired tokens when issuing a new token' do
    expired_user = create_user(
      'expired_reset_user',
      email: 'expired-reset@example.com',
      verified: true
    )
    active_user = create_user(
      'active_reset_user',
      email: 'active-reset@example.com',
      verified: true
    )
    expired_token = PasswordResetToken.create!(
      user: expired_user,
      token_digest: 'expired-token-digest',
      expires_at: @current_time
    )
    active_token = PasswordResetToken.create!(
      user: active_user,
      token_digest: 'active-token-digest',
      expires_at: @current_time + 1.second
    )

    issue_token

    refute PasswordResetToken.exists?(expired_token.id)
    assert PasswordResetToken.exists?(active_token.id)
    assert_equal 2, PasswordResetToken.count
  end

  test 'rejects users without a verified eligible email identity' do
    unverified_user = create_user(
      'unverified_reset_issuer',
      email: 'unverified-reset@example.com'
    )
    guest = create_user(
      User::SHARED_GUEST_USERNAME,
      email: 'guest@example.com',
      verified: true
    )

    assert_raises(ActiveRecord::RecordInvalid) do
      issue_token(user: unverified_user)
    end
    assert_raises(ActiveRecord::RecordInvalid) do
      issue_token(user: guest)
    end
    assert_equal 0, PasswordResetToken.count
  end

  private

  def issue_token(user: @user, current_time: @current_time)
    PasswordResetTokenIssuer.new(
      user: user,
      current_time: current_time
    ).call
  end

  def create_user(username, email:, verified: false)
    user = User.create!(
      username: username,
      email: email,
      password: 'password'
    )
    user.update!(email_verified_at: @current_time) if verified
    user
  end
end
