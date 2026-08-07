require 'test_helper'

class PostWriterTest < ActiveSupport::TestCase
  setup do
    @user = users(:one)
  end

  test 'creates a post with normalized unique tags' do
    post = build_post

    result = write(
      post: post,
      tag_names: [' Photography ', 'SUNSET', 'photography']
    )

    assert result.success?, result.errors.inspect
    assert post.persisted?
    assert_equal %w[photography sunset], post.tags.order(:name).pluck(:name)
    assert_equal 2, post.post_tags.count
  end

  test 'reuses an existing tag' do
    existing_tag = tags(:photography)
    post = build_post

    result = write(post: post, tag_names: ['PHOTOGRAPHY'])

    assert result.success?, result.errors.inspect
    assert_equal [existing_tag.id], post.tags.ids
    assert_equal 2, Tag.count
  end

  test 'does not persist tags when the post is invalid' do
    post = build_post(title: '')
    initial_tag_count = Tag.count

    result = write(post: post, tag_names: ['new_tag'])

    refute result.success?
    assert_includes result.errors, "Title can't be blank"
    refute post.persisted?
    assert_equal initial_tag_count, Tag.count
  end

  test 'rolls back the post when a tag is invalid' do
    post = build_post
    initial_post_count = Post.count
    initial_tag_count = Tag.count

    result = write(post: post, tag_names: ['valid_tag', 'invalid-tag'])

    refute result.success?
    assert_includes result.errors, 'Name is invalid'
    assert_equal initial_post_count, Post.count
    assert_equal initial_tag_count, Tag.count
  end

  test 'limits the number of unique normalized tags' do
    post = build_post
    initial_tag_count = Tag.count

    result = write(
      post: post,
      tag_names: %w[one two three four five six ONE]
    )

    refute result.success?
    assert_equal ['Posts can have up to 5 tags'], result.errors
    refute post.persisted?
    assert_equal initial_tag_count, Tag.count
  end

  test 'does not count normalized duplicates toward the tag limit' do
    post = build_post

    result = write(
      post: post,
      tag_names: %w[one two three four five ONE]
    )

    assert result.success?, result.errors.inspect
    assert_equal %w[five four one three two], post.tags.order(:name).pluck(:name)
  end

  test 'replaces tags while editing a post' do
    post = editable_post

    result = write(
      post: post,
      attributes: { title: 'Updated title' },
      tag_names: %w[sunset travel]
    )

    assert result.success?, result.errors.inspect
    assert_equal 'Updated title', post.reload.title
    assert_equal %w[sunset travel], post.tags.order(:name).pluck(:name)
  end

  test 'removes all tags when given an empty array' do
    post = editable_post

    result = write(post: post, tag_names: [])

    assert result.success?, result.errors.inspect
    assert_empty post.reload.tags
  end

  test 'preserves tags when tag names are omitted' do
    post = editable_post
    original_tag_ids = post.tag_ids

    result = write(
      post: post,
      attributes: { title: 'Updated title' },
      tag_names: nil
    )

    assert result.success?, result.errors.inspect
    assert_equal original_tag_ids, post.reload.tag_ids
  end

  test 'rolls back post and tag changes when an edit fails' do
    post = editable_post
    original_title = post.title
    original_tag_ids = post.tag_ids

    result = write(
      post: post,
      attributes: { title: 'Changed title' },
      tag_names: ['new_tag', 'invalid-tag']
    )

    refute result.success?
    assert_equal original_title, post.reload.title
    assert_equal original_tag_ids, post.tag_ids
    refute Tag.exists?(name: 'new_tag')
  end

  private

  def build_post(title: 'New post')
    Post.new(
      author: @user,
      title: title,
      post_type: Post::TYPES[:text]
    )
  end

  def editable_post
    build_post(title: 'Existing post').tap do |post|
      post.save!
      post.tags << tags(:photography)
    end
  end

  def write(post:, attributes: {}, tag_names:)
    PostWriter.new(
      post: post,
      attributes: attributes,
      tag_names: tag_names
    ).call
  end
end
