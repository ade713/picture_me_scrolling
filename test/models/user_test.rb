# == Schema Information
#
# Table name: users
#
#  id                  :integer          not null, primary key
#  username            :string           not null
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

  def create_user(username)
    User.create!(
      username: username,
      password: "password"
    )
  end
end
