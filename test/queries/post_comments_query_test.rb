require 'test_helper'

class PostCommentsQueryTest < ActiveSupport::TestCase
  test 'orders top-level comments newest first with an id tie breaker and counts replies' do
    timestamp = Time.current.change(usec: 0)
    first = create_comment(created_at: timestamp)
    second = create_comment(created_at: timestamp)
    reply = create_comment(parent: second)
    create_comment(post: posts(:two))

    comments, pagination, counts = PostCommentsQuery.call(post: posts(:one), per_page: 1)

    assert_equal [second.id], comments.map(&:id)
    assert_equal 1, counts[second.id]
    assert pagination[:has_more]
    following, final_page = PostCommentsQuery.call(post: posts(:one), after: pagination[:next_cursor])
    assert_equal [first.id], following.map(&:id)
    refute_includes following.map(&:id), reply.id
    refute final_page[:has_more]
    assert_nil final_page[:next_cursor]
  end

  test 'cursor still works when its anchor is deleted and newer comments are inserted' do
    first = create_comment
    second = create_comment
    _, pagination = PostCommentsQuery.call(post: posts(:one), per_page: 1)
    CommentDeletion.new(comment: second).call
    third = create_comment

    comments, = PostCommentsQuery.call(post: posts(:one), after: pagination[:next_cursor])

    assert_equal [first.id], comments.map(&:id)
    refreshed, = PostCommentsQuery.call(post: posts(:one))
    assert_equal [third.id, first.id], refreshed.map(&:id)
  end

  test 'prioritizes creation time over id across pages' do
    newest = create_comment(created_at: 1.minute.ago)
    oldest = create_comment(created_at: 3.minutes.ago)
    middle = create_comment(created_at: 2.minutes.ago)

    comments, pagination = PostCommentsQuery.call(post: posts(:one), per_page: 2)
    assert_equal [newest.id, middle.id], comments.map(&:id)
    older, final_page = PostCommentsQuery.call(post: posts(:one), after: pagination[:next_cursor], per_page: 2)
    assert_equal [oldest.id], older.map(&:id)
    refute final_page[:has_more]
  end

  test 'rejects cursors issued under the previous oldest-first ordering' do
    comment = create_comment
    cursor = Rails.application.message_verifier('post_comments').generate(
      { 'post_id' => comment.post_id, 'created_at' => comment.created_at.iso8601(6), 'id' => comment.id },
      purpose: 'post_comments'
    )

    assert_raises PostCommentsQuery::InvalidCursorError do
      PostCommentsQuery.call(post: posts(:one), after: cursor)
    end
  end

  test 'rejects invalid cursors and cursors issued for another post' do
    2.times { create_comment }
    _, pagination = PostCommentsQuery.call(post: posts(:one), per_page: 1)

    ['invalid', ['invalid'], pagination[:next_cursor]].each do |cursor|
      assert_raises PostCommentsQuery::InvalidCursorError do
        PostCommentsQuery.call(post: posts(:two), after: cursor)
      end
    end
  end

  test 'normalizes page size and returns empty pagination' do
    { nil => 20, 'bad' => 1, 0 => 1, 100 => 50 }.each do |requested, expected|
      comments, pagination, counts = PostCommentsQuery.call(post: posts(:one), per_page: requested)

      assert_empty comments
      assert_empty counts
      assert_equal expected, pagination[:per_page]
      refute pagination[:has_more]
      assert_nil pagination[:next_cursor]
    end
  end

  private

  def create_comment(**attributes)
    Comment.create!({ post: posts(:one), user: users(:one), body: 'A comment' }.merge(attributes))
  end
end
