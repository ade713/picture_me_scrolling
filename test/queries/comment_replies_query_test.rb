require 'test_helper'

class CommentRepliesQueryTest < ActiveSupport::TestCase
  setup do
    @parent = Comment.create!(post: posts(:one), user: users(:one), body: 'Parent')
  end

  test 'returns latest three chronologically and prepends older batches with stable ties' do
    timestamp = Time.current.change(usec: 0)
    replies = 7.times.map { reply(created_at: timestamp) }
    batch, pagination = CommentRepliesQuery.call(parent: @parent)
    assert_equal replies.last(3).map(&:id), batch.map(&:id)
    assert_equal 3, pagination[:per_page]
    older, pagination = CommentRepliesQuery.call(parent: @parent, before: pagination[:next_cursor])
    assert_equal replies[1, 3].map(&:id), older.map(&:id)
    oldest, pagination = CommentRepliesQuery.call(parent: @parent, before: pagination[:next_cursor])
    assert_equal [replies.first.id], oldest.map(&:id)
    refute pagination[:has_more]
    assert_nil pagination[:next_cursor]
  end

  test 'uses creation time before id and survives anchor deletion and new replies' do
    newest = reply(created_at: 1.minute.ago)
    oldest = reply(created_at: 3.minutes.ago)
    middle = reply(created_at: 2.minutes.ago)
    batch, pagination = CommentRepliesQuery.call(parent: @parent, per_page: 2)
    assert_equal [middle.id, newest.id], batch.map(&:id)
    CommentDeletion.new(comment: middle).call
    reply
    older, = CommentRepliesQuery.call(parent: @parent, before: pagination[:next_cursor])
    assert_equal [oldest.id], older.map(&:id)
  end

  test 'rejects malformed and foreign-parent cursors' do
    2.times { reply }
    _, pagination = CommentRepliesQuery.call(parent: @parent, per_page: 1)
    other = Comment.create!(post: posts(:one), user: users(:one), body: 'Other parent')
    ['invalid', ['invalid'], pagination[:next_cursor]].each do |cursor|
      assert_raises CommentRepliesQuery::InvalidCursorError do
        CommentRepliesQuery.call(parent: other, before: cursor)
      end
    end
  end

  test 'normalizes page sizes and returns empty metadata' do
    { nil => 3, 'bad' => 1, 0 => 1, 100 => 50 }.each do |requested, expected|
      comments, pagination = CommentRepliesQuery.call(parent: @parent, per_page: requested)
      assert_empty comments
      assert_equal expected, pagination[:per_page]
      refute pagination[:has_more]
      assert_nil pagination[:next_cursor]
    end
  end

  private

  def reply(**attributes)
    Comment.create!({ post: @parent.post, parent: @parent, user: users(:two), body: 'Reply' }.merge(attributes))
  end
end
