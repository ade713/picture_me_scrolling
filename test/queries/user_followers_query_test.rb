require 'test_helper'

class UserFollowersQueryTest < ActiveSupport::TestCase
  setup do
    Follow.delete_all
    User.delete_all

    @profile_user = create_user('profile_user')
    @older_follower = create_user('older_follower')
    @newer_follower = create_user('newer_follower')
    @unrelated_user = create_user('unrelated_user')
    @older_follow = create_follow(@older_follower, @profile_user)
    @newer_follow = create_follow(@newer_follower, @profile_user)
    create_follow(@unrelated_user, @older_follower)
  end

  test 'returns followers newest first with an id tie breaker' do
    shared_timestamp = Time.zone.local(2026, 1, 1, 12, 0, 0)
    @older_follow.update!(created_at: shared_timestamp)
    @newer_follow.update!(created_at: shared_timestamp)

    users, pagination = UserFollowersQuery.call(user: @profile_user)

    assert_equal [@newer_follower.id, @older_follower.id], users.map(&:id)
    refute_includes users.map(&:id), @unrelated_user.id
    assert_equal 2, pagination[:total_count]
  end

  test 'paginates follower relationships' do
    first_users, first_page = UserFollowersQuery.call(
      user: @profile_user,
      page: 1,
      per_page: 1
    )
    second_users, second_page = UserFollowersQuery.call(
      user: @profile_user,
      page: 2,
      per_page: 1
    )

    assert_equal [@newer_follower.id], first_users.map(&:id)
    assert_equal 2, first_page[:total_pages]
    assert first_page[:has_more]
    assert_equal [@older_follower.id], second_users.map(&:id)
    refute second_page[:has_more]
  end

  test 'returns empty pagination for a user without followers' do
    users, pagination = UserFollowersQuery.call(user: @unrelated_user)

    assert_empty users
    assert_equal 0, pagination[:total_count]
    assert_equal 0, pagination[:total_pages]
    refute pagination[:has_more]
  end

  test 'preloads follower avatars' do
    users, = UserFollowersQuery.call(user: @profile_user)

    users.each do |user|
      assert_predicate user.association(:avatar_attachment), :loaded?
    end
  end

  private

  def create_user(username)
    User.create!(username: username, password: 'password')
  end

  def create_follow(follower, followee)
    Follow.create!(follower: follower, followee: followee)
  end
end
