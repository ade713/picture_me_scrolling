require 'test_helper'

class PostCommentsQueryTest < ActiveSupport::TestCase
  test 'orders top-level comments oldest first with an id tie breaker and counts replies' do
    timestamp = Time.current.change(usec: 0)
    first = create_comment(created_at: timestamp)
    second = create_comment(created_at: timestamp)
    reply = create_comment(parent: first)
    create_comment(post: posts(:two))

    comments, pagination, counts = PostCommentsQuery.call(post: posts(:one), per_page: 1)

    assert_equal [first.id], comments.map(&:id)
    assert_equal 1, counts[first.id]
    assert pagination[:has_more]
    following, final_page = PostCommentsQuery.call(post: posts(:one), after: pagination[:next_cursor])
    assert_equal [second.id], following.map(&:id)
    refute_includes following.map(&:id), reply.id
    refute final_page[:has_more]
    assert_nil final_page[:next_cursor]
  end

  test 'cursor still works when its anchor is deleted and newer comments are inserted' do
    first = create_comment
    second = create_comment
    _, pagination = PostCommentsQuery.call(post: posts(:one), per_page: 1)
    CommentDeletion.new(comment: first).call
    third = create_comment

    comments, = PostCommentsQuery.call(post: posts(:one), after: pagination[:next_cursor])

    assert_equal [second.id, third.id], comments.map(&:id)
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
