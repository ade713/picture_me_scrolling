require 'test_helper'

class UserPostsQueryTest < ActiveSupport::TestCase
  setup do
    PostTag.delete_all
    Post.delete_all
    User.delete_all

    @profile_user = create_user('profile_user')
    @other_user = create_user('other_user')
    @older_post = create_post(@profile_user, 'older post')
    @newer_post = create_post(@profile_user, 'newer post')
    @other_post = create_post(@other_user, 'other post')
  end

  test 'returns only the profile users posts in stable newest-first order' do
    shared_timestamp = Time.zone.local(2026, 1, 1, 12, 0, 0)
    @older_post.update!(created_at: shared_timestamp)
    @newer_post.update!(created_at: shared_timestamp)

    posts, pagination = UserPostsQuery.call(user: @profile_user)

    assert_equal [@newer_post.id, @older_post.id], posts.map(&:id)
    refute_includes posts.map(&:id), @other_post.id
    assert_equal 2, pagination[:total_count]
  end

  test 'paginates profile posts' do
    first_posts, first_page = UserPostsQuery.call(
      user: @profile_user,
      page: 1,
      per_page: 1
    )
    second_posts, second_page = UserPostsQuery.call(
      user: @profile_user,
      page: 2,
      per_page: 1
    )

    assert_equal [@newer_post.id], first_posts.map(&:id)
    assert_equal 2, first_page[:total_pages]
    assert first_page[:has_more]
    assert_equal [@older_post.id], second_posts.map(&:id)
    refute second_page[:has_more]
  end

  test 'filters profile posts by a normalized tag before pagination' do
    @older_post.tags << tags(:photography)
    @newer_post.tags << tags(:sunset)
    @other_post.tags << tags(:photography)

    posts, pagination = UserPostsQuery.call(
      user: @profile_user,
      tag: ' Photography ',
      per_page: 1
    )

    assert_equal [@older_post.id], posts.map(&:id)
    assert_equal 1, pagination[:total_count]
    assert_equal 1, pagination[:total_pages]
    refute pagination[:has_more]
  end

  test 'returns an empty result for a tag without matching profile posts' do
    posts, pagination = UserPostsQuery.call(
      user: @profile_user,
      tag: 'nonexistent'
    )

    assert_empty posts
    assert_equal 0, pagination[:total_count]
    assert_equal 0, pagination[:total_pages]
    refute pagination[:has_more]
  end

  test 'rejects malformed tag filters' do
    error = assert_raises(UserPostsQuery::InvalidTagError) do
      UserPostsQuery.call(user: @profile_user, tag: 'invalid-tag')
    end

    assert_equal 'Tag filter is invalid', error.message
  end

  test 'preloads post rendering associations' do
    posts, = UserPostsQuery.call(user: @profile_user)

    posts.each do |post|
      assert_predicate post.association(:tags), :loaded?
      assert_predicate post.association(:author), :loaded?
      assert_predicate post.association(:image_attachment), :loaded?
      assert_predicate post.author.association(:avatar_attachment), :loaded?
    end
  end

  private

  def create_user(username)
    User.create!(username: username, password: 'password')
  end

  def create_post(author, title)
    Post.create!(author: author, title: title, post_type: 'text')
  end
end
