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

  private

  def create_user(username)
    User.create!(
      username: username,
      password: "password"
    )
  end
end
