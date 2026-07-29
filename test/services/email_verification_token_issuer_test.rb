require 'test_helper'

class EmailVerificationTokenIssuerTest < ActiveSupport::TestCase
  setup do
    EmailVerificationToken.delete_all
    User.delete_all

    @current_time = Time.zone.parse('2026-07-28 12:00:00')
    @user = create_user('issuer_user', email: 'issuer@example.com')
  end

  test 'issues a raw token while storing only its digest' do
    result = issue_token
    verification_token = result.verification_token

    assert result.raw_token.present?
    refute_equal result.raw_token, verification_token.token_digest
    assert_equal(
      EmailVerificationToken.digest(result.raw_token),
      verification_token.token_digest
    )
    assert_equal(
      @current_time + EmailVerificationTokenIssuer::LIFETIME,
      verification_token.expires_at
    )
  end

  test 'replaces the existing token without adding another row' do
    first_result = issue_token

    assert_no_difference('EmailVerificationToken.count') do
      second_result = issue_token(current_time: @current_time + 1.hour)

      assert_equal(
        first_result.verification_token.id,
        second_result.verification_token.id
      )
      refute_equal first_result.raw_token, second_result.raw_token
      refute_equal(
        EmailVerificationToken.digest(first_result.raw_token),
        second_result.verification_token.token_digest
      )
    end
  end

  test 'rejects users without an eligible email identity' do
    legacy_user = create_user('legacy_issuer_user')
    guest = create_user(
      User::SHARED_GUEST_USERNAME,
      email: 'guest@example.com'
    )

    assert_raises(ActiveRecord::RecordInvalid) do
      issue_token(user: legacy_user)
    end
    assert_raises(ActiveRecord::RecordInvalid) do
      issue_token(user: guest)
    end
    assert_equal 0, EmailVerificationToken.count
  end

  private

  def issue_token(user: @user, current_time: @current_time)
    EmailVerificationTokenIssuer.new(
      user: user,
      current_time: current_time
    ).call
  end

  def create_user(username, email: nil)
    User.create!(
      username: username,
      email: email,
      password: 'password'
    )
  end
end
