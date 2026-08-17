require 'test_helper'

class UserFollowingQueryTest < ActiveSupport::TestCase
  setup do
    Follow.delete_all
    User.delete_all

    @profile_user = create_user('profile_user')
    @older_followee = create_user('older_followee')
    @newer_followee = create_user('newer_followee')
    @unrelated_user = create_user('unrelated_user')
    @older_follow = create_follow(@profile_user, @older_followee)
    @newer_follow = create_follow(@profile_user, @newer_followee)
    create_follow(@older_followee, @unrelated_user)
  end

  test 'returns followed users newest first with an id tie breaker' do
    shared_timestamp = Time.zone.local(2026, 1, 1, 12, 0, 0)
    @older_follow.update!(created_at: shared_timestamp)
    @newer_follow.update!(created_at: shared_timestamp)

    users, pagination = UserFollowingQuery.call(user: @profile_user)

    assert_equal [@newer_followee.id, @older_followee.id], users.map(&:id)
    refute_includes users.map(&:id), @unrelated_user.id
    assert_equal 2, pagination[:total_count]
  end

  test 'paginates following relationships' do
    first_users, first_page = UserFollowingQuery.call(
      user: @profile_user,
      page: 1,
      per_page: 1
    )
    second_users, second_page = UserFollowingQuery.call(
      user: @profile_user,
      page: 2,
      per_page: 1
    )

    assert_equal [@newer_followee.id], first_users.map(&:id)
    assert_equal 2, first_page[:total_pages]
    assert first_page[:has_more]
    assert_equal [@older_followee.id], second_users.map(&:id)
    refute second_page[:has_more]
  end

  test 'returns empty pagination for a user who follows no one' do
    users, pagination = UserFollowingQuery.call(user: @unrelated_user)

    assert_empty users
    assert_equal 0, pagination[:total_count]
    assert_equal 0, pagination[:total_pages]
    refute pagination[:has_more]
  end

  test 'preloads followed user avatars' do
    users, = UserFollowingQuery.call(user: @profile_user)

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
