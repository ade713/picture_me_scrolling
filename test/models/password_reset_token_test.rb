# == Schema Information
#
# Table name: password_reset_tokens
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  token_digest :string           not null
#  expires_at   :datetime         not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

require 'test_helper'

class PasswordResetTokenTest < ActiveSupport::TestCase
  setup do
    PasswordResetToken.delete_all
    User.delete_all

    @user = create_user(
      'reset_token_user',
      email: 'reset-token@example.com',
      verified: true
    )
  end

  test 'is valid for an eligible user with a digest and expiration' do
    assert build_token.valid?
  end

  test 'requires a verified email address and rejects the shared guest' do
    unverified_user = create_user(
      'unverified_reset_user',
      email: 'unverified@example.com'
    )
    guest = create_user(
      User::SHARED_GUEST_USERNAME,
      email: 'guest@example.com',
      verified: true
    )

    unverified_token = build_token(user: unverified_user)
    guest_token = build_token(user: guest)

    refute unverified_token.valid?
    assert_includes unverified_token.errors.full_messages,
                    'User must have a verified email address'
    refute guest_token.valid?
    assert_includes guest_token.errors.full_messages,
                    'User cannot be the shared guest account'
  end

  test 'allows only one token per user' do
    build_token.save!
    duplicate = build_token(token_digest: 'different-digest')

    refute duplicate.valid?
    assert_includes duplicate.errors.full_messages,
                    'User already has a password reset token'
  end

  test 'digests and finds a raw token without storing it' do
    raw_token = 'temporary-raw-token'
    reset_token = build_token(
      token_digest: PasswordResetToken.digest(raw_token)
    )
    reset_token.save!

    assert_equal reset_token, PasswordResetToken.find_by_raw_token(raw_token)
    refute_equal raw_token, reset_token.token_digest
    assert_nil PasswordResetToken.find_by_raw_token('different-token')
  end

  test 'detects expiration at the boundary' do
    expires_at = Time.zone.parse('2026-07-30 12:00:00')
    reset_token = build_token(expires_at: expires_at)

    refute reset_token.expired?(at: expires_at - 1.second)
    assert reset_token.expired?(at: expires_at)
  end

  private

  def build_token(
    user: @user,
    token_digest: 'reset-token-digest',
    expires_at: 30.minutes.from_now
  )
    PasswordResetToken.new(
      user: user,
      token_digest: token_digest,
      expires_at: expires_at
    )
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
end
