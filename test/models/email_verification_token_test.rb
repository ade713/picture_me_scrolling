# == Schema Information
#
# Table name: email_verification_tokens
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  token_digest :string           not null
#  expires_at   :datetime         not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

require 'test_helper'

class EmailVerificationTokenTest < ActiveSupport::TestCase
  setup do
    EmailVerificationToken.delete_all
    User.delete_all

    @user = create_user('verification_user', email: 'user@example.com')
  end

  test 'is valid for an eligible user with a digest and expiration' do
    verification_token = build_token

    assert verification_token.valid?
  end

  test 'requires an eligible user with an email address' do
    legacy_user = create_user('legacy_user')
    guest = create_user(
      User::SHARED_GUEST_USERNAME,
      email: 'guest@example.com'
    )

    legacy_token = build_token(user: legacy_user)
    guest_token = build_token(user: guest)

    refute legacy_token.valid?
    assert_includes legacy_token.errors.full_messages,
                    'User must have an email address'
    refute guest_token.valid?
    assert_includes guest_token.errors.full_messages,
                    'User cannot be the shared guest account'
  end

  test 'allows only one token per user' do
    build_token.save!
    duplicate = build_token(token_digest: 'different-digest')

    refute duplicate.valid?
    assert_includes duplicate.errors.full_messages,
                    'User already has a verification token'
  end

  test 'detects expiration at the boundary' do
    expires_at = Time.zone.parse('2026-07-29 12:00:00')
    verification_token = build_token(expires_at: expires_at)

    refute verification_token.expired?(at: expires_at - 1.second)
    assert verification_token.expired?(at: expires_at)
  end

  private

  def build_token(user: @user, token_digest: 'token-digest', expires_at: 1.day.from_now)
    EmailVerificationToken.new(
      user: user,
      token_digest: token_digest,
      expires_at: expires_at
    )
  end

  def create_user(username, email: nil)
    User.create!(
      username: username,
      email: email,
      password: 'password'
    )
  end
end
