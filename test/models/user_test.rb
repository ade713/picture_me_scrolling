# == Schema Information
#
# Table name: users
#
#  id                  :integer          not null, primary key
#  username            :string           not null
#  email               :string
#  email_verified_at   :datetime
#  password_digest     :string           not null
#  session_token       :string           not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

require "test_helper"

class UserTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup do
    Follow.delete_all
    User.delete_all
  end

  test "recommended_follow_users excludes the current user and followed users" do
    viewer = create_user("viewer")
    followed_user = create_user("followed_user")
    recommended_user = create_user("recommended_user")

    Follow.create!(
      follower_id: viewer.id,
      followee_id: followed_user.id
    )

    recommended_users = viewer.recommended_follow_users

    assert_includes recommended_users, recommended_user
    refute_includes recommended_users, viewer
    refute_includes recommended_users, followed_user
  end

  test "recommended_follow_users limits results by default" do
    viewer = create_user("viewer")
    7.times { |idx| create_user("recommended_user_#{idx}") }

    assert_equal 6, viewer.recommended_follow_users.length
  end

  test "recommended_follow_users accepts a custom limit" do
    viewer = create_user("viewer")
    3.times { |idx| create_user("recommended_user_#{idx}") }

    assert_equal 2, viewer.recommended_follow_users(limit: 2).length
  end

  test "recommended_follow_users returns empty when every other user is followed" do
    viewer = create_user("viewer")
    followed_user = create_user("followed_user")

    Follow.create!(
      follower_id: viewer.id,
      followee_id: followed_user.id
    )

    assert_empty viewer.recommended_follow_users
  end

  test "password validation rejects values beyond the bcrypt byte limit" do
    user = User.new(
      username: "long_password_user",
      password: "é" * 37
    )

    refute user.valid?
    assert_includes user.errors.full_messages,
                    "Password is too long (maximum is #{User::MAXIMUM_PASSWORD_BYTES} bytes)"
  end

  test "password validation rejects values beyond the character limit" do
    user = User.new(
      username: "long_password_user",
      password: "a" * (User::MAXIMUM_PASSWORD_LENGTH + 1)
    )

    refute user.valid?
    assert_includes user.errors.full_messages, "Password is too long (maximum is 64 characters)"
  end

  test "email is optional for existing users" do
    assert create_user("legacy_user").valid?
  end

  test "email is normalized before validation" do
    user = create_user("email_user", email: "  USER@Example.COM ")

    assert_equal "user@example.com", user.email
  end

  test "blank email is normalized to nil" do
    user = create_user("blank_email_user", email: "   ")

    assert_nil user.email
  end

  test "email must have a valid format" do
    user = build_user("invalid_email_user", email: "not-an-email")

    refute user.valid?
    assert_includes user.errors.full_messages, "Email is invalid"
  end

  test "email cannot exceed the maximum length" do
    local_part = "a" * User::MAXIMUM_EMAIL_LENGTH
    user = build_user("long_email_user", email: "#{local_part}@example.com")

    refute user.valid?
    assert_includes user.errors.full_messages,
                    "Email is too long (maximum is #{User::MAXIMUM_EMAIL_LENGTH} characters)"
  end

  test "email must be unique regardless of case or surrounding whitespace" do
    create_user("first_email_user", email: "user@example.com")
    duplicate = build_user(
      "duplicate_email_user",
      email: " USER@EXAMPLE.COM "
    )

    refute duplicate.valid?
    assert_includes duplicate.errors.full_messages, "Email has already been taken"
  end

  test "changing email clears its verification timestamp and identity tokens" do
    user = create_user("verified_email_user", email: "current@example.com")
    user.update!(email_verified_at: Time.current)
    verification_token = EmailVerificationToken.create!(
      user: user,
      token_digest: "email-change-token",
      expires_at: 1.day.from_now
    )
    reset_token = PasswordResetToken.create!(
      user: user,
      token_digest: "password-reset-token",
      expires_at: 30.minutes.from_now
    )

    user.update!(email: "new@example.com")

    assert_nil user.email_verified_at
    refute EmailVerificationToken.exists?(verification_token.id)
    refute PasswordResetToken.exists?(reset_token.id)
  end

  test "account settings are disabled only for the shared guest" do
    guest = create_user(User::SHARED_GUEST_USERNAME)
    user = create_user("settings_user")

    refute guest.account_settings_enabled?
    assert user.account_settings_enabled?
  end

  test "destroying a user purges the avatar blob and stored object without a job" do
    user = create_user("avatar_destroy_user")
    File.open(Rails.root.join("app/assets/images/profile_blue_150x150.png")) do |file|
      user.avatar.attach(
        io: file,
        filename: "avatar.png",
        content_type: "image/png"
      )
    end
    blob = user.avatar.blob
    key = blob.key

    assert_no_enqueued_jobs only: ActiveStorage::PurgeJob do
      user.destroy!
    end

    refute ActiveStorage::Blob.exists?(blob.id)
    refute ActiveStorage::Blob.service.exist?(key)
  end

  private

  def build_user(username, email: nil)
    User.new(
      username: username,
      password: "password",
      email: email
    )
  end

  def create_user(username, email: nil)
    build_user(username, email: email).tap(&:save!)
  end
end
