require 'test_helper'

class FeedQueryTest < ActiveSupport::TestCase
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all

    @viewer = create_user('viewer')
    @followed_author = create_user('followed_author')
    @unrelated_author = create_user('unrelated_author')

    @viewer_post = create_post(@viewer, 'viewer post')
    @followed_post = create_post(@followed_author, 'followed post')
    @unrelated_post = create_post(@unrelated_author, 'unrelated post')

    Follow.create!(
      follower_id: @viewer.id,
      followee_id: @followed_author.id
    )
  end

  test 'returns current user and followed user posts only' do
    posts, pagination = FeedQuery.call(user: @viewer)
    post_ids = posts.map(&:id)

    assert_includes post_ids, @viewer_post.id
    assert_includes post_ids, @followed_post.id
    refute_includes post_ids, @unrelated_post.id
    assert_equal 2, pagination[:total_count]
  end

  test 'preloads tags for feed rendering' do
    @viewer_post.tags << tags(:photography)

    posts, = FeedQuery.call(user: @viewer)

    posts.each do |post|
      assert_predicate post.association(:tags), :loaded?
    end
  end

  test 'returns own posts when user follows no one' do
    posts, pagination = FeedQuery.call(user: @unrelated_author)
    post_ids = posts.map(&:id)

    assert_equal [@unrelated_post.id], post_ids
    assert_equal 1, pagination[:total_count]
  end

  test 'orders posts newest first with id tie breaker' do
    older_timestamp = Time.zone.local(2026, 1, 1, 11, 0, 0)
    shared_timestamp = Time.zone.local(2026, 1, 1, 12, 0, 0)
    @viewer_post.update!(created_at: older_timestamp)
    @followed_post.update!(created_at: shared_timestamp)
    newer_viewer_post = create_post(
      @viewer,
      'newer viewer post',
      created_at: shared_timestamp
    )

    posts, = FeedQuery.call(user: @viewer)

    assert_equal(
      [newer_viewer_post.id, @followed_post.id, @viewer_post.id],
      posts.map(&:id)
    )
  end

  test 'paginates feed posts' do
    first_page_posts, first_page = FeedQuery.call(
      user: @viewer,
      page: 1,
      per_page: 1
    )
    second_page_posts, second_page = FeedQuery.call(
      user: @viewer,
      page: 2,
      per_page: 1
    )

    assert_equal 1, first_page_posts.length
    assert_equal 1, first_page[:page]
    assert_equal 1, first_page[:per_page]
    assert_equal 2, first_page[:total_count]
    assert_equal 2, first_page[:total_pages]
    assert_equal true, first_page[:has_more]

    assert_equal 1, second_page_posts.length
    refute_equal first_page_posts.first.id, second_page_posts.first.id
    assert_equal 2, second_page[:page]
    assert_equal false, second_page[:has_more]
  end

  test 'filters accessible posts by normalized tag' do
    @viewer_post.tags << tags(:photography)
    @viewer_post.tags << tags(:sunset)
    @followed_post.tags << tags(:photography)
    @unrelated_post.tags << tags(:photography)

    posts, pagination = FeedQuery.call(user: @viewer, tag: ' Photography ')

    assert_equal [@followed_post.id, @viewer_post.id], posts.map(&:id)
    assert_equal 2, pagination[:total_count]
    assert_equal %w[photography sunset], posts.last.tags.map(&:name).sort
    assert_predicate posts.last.association(:tags), :loaded?
  end

  test 'calculates pagination after filtering by tag' do
    @viewer_post.tags << tags(:photography)

    posts, pagination = FeedQuery.call(
      user: @viewer,
      tag: 'photography',
      page: 1,
      per_page: 1
    )

    assert_equal [@viewer_post.id], posts.map(&:id)
    assert_equal 1, pagination[:total_count]
    assert_equal 1, pagination[:total_pages]
    assert_equal false, pagination[:has_more]
  end

  test 'returns an empty paginated feed for a nonexistent tag' do
    posts, pagination = FeedQuery.call(user: @viewer, tag: 'nonexistent')

    assert_empty posts
    assert_equal 0, pagination[:total_count]
    assert_equal 0, pagination[:total_pages]
    assert_equal false, pagination[:has_more]
  end

  test 'rejects malformed tag filters' do
    error = assert_raises(FeedQuery::InvalidTagError) do
      FeedQuery.call(user: @viewer, tag: 'invalid-tag')
    end

    assert_equal FeedQuery::INVALID_TAG_ERROR, error.message
  end

  test 'rejects a blank tag filter' do
    assert_raises(FeedQuery::InvalidTagError) do
      FeedQuery.call(user: @viewer, tag: ' ')
    end
  end

  test 'normalizes invalid pagination params' do
    _posts, pagination = FeedQuery.call(user: @viewer, page: 0, per_page: 100)

    assert_equal 1, pagination[:page]
    assert_equal FeedQuery::MAX_PER_PAGE, pagination[:per_page]
  end

  private

  def create_user(username)
    User.create!(
      username: username,
      password: 'password'
    )
  end

  def create_post(author, title, created_at: nil)
    attributes = {
      author_id: author.id,
      title: title,
      post_type: 'text'
    }
    attributes[:created_at] = created_at if created_at

    Post.create!(attributes)
  end
end
