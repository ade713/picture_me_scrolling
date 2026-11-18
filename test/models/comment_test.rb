require 'test_helper'

class CommentTest < ActiveSupport::TestCase
  test 'stores multiple comments by the same user on a post' do
    first = create_comment
    second = create_comment(body: 'Another thought')

    assert_includes posts(:one).comments, first
    assert_includes posts(:one).comments, second
    assert_includes users(:one).comments, first
    assert_includes users(:one).comments, second
    assert_nil first.parent
  end

  test 'links a reply to its parent, post, and author' do
    parent = create_comment
    reply = create_comment(parent: parent, user: users(:two))

    assert_equal parent, reply.reload.parent
    assert_equal [reply], parent.replies.to_a
    assert_equal posts(:one), reply.post
    assert_equal users(:two), reply.user
  end

  test 'stores an anonymous deleted placeholder with replies' do
    parent = create_comment
    reply = create_comment(parent: parent)
    parent.update!(body: nil, user: nil, deleted_at: Time.current)

    parent.reload
    assert_nil parent.body
    assert_nil parent.user
    assert_not_nil parent.deleted_at
    assert_equal [reply], parent.replies.to_a
  end

  test 'database requires a post' do
    comment = create_comment

    assert_raises ActiveRecord::NotNullViolation do
      comment.update_column(:post_id, nil)
    end
  end

  test 'database rejects nonexistent post, user, and parent references' do
    comment = create_comment

    [:post_id, :user_id, :parent_id].each do |foreign_key|
      # Isolate constraint failures so PostgreSQL can run the next assertion.
      Comment.transaction(requires_new: true) do
        assert_raises ActiveRecord::InvalidForeignKey do
          comment.update_column(foreign_key, -1)
        end
        raise ActiveRecord::Rollback
      end
    end
  end

  test 'database prevents deleting a parent while replies still reference it' do
    parent = create_comment
    create_comment(parent: parent)

    assert_raises ActiveRecord::InvalidForeignKey do
      parent.delete
    end
  end

  test 'active comments require an author and nonblank body' do
    [nil, '', " \n\t"].each do |body|
      comment = build_comment(body: body, user: nil)

      refute comment.valid?
      assert_includes comment.errors[:body], "can't be blank"
      assert_includes comment.errors[:user], "can't be blank"
    end
  end

  test 'body permits 1000 characters but rejects 1001 characters' do
    assert build_comment(body: 'a' * 1_000).valid?
    comment = build_comment(body: 'a' * 1_001)

    refute comment.valid?
    assert_includes comment.errors[:body], 'is too long (maximum is 1000 characters)'
  end

  test 'body preserves plain text without interpreting markup' do
    body = "<strong>Hello</strong>\nSecond line"

    assert_equal body, create_comment(body: body).reload.body
  end

  test 'reply requires an existing parent on the same post' do
    missing_parent = build_comment(parent_id: -1)
    refute missing_parent.valid?
    assert_includes missing_parent.errors[:parent], 'must exist'

    reply = build_comment(parent: create_comment(post: posts(:two)))
    refute reply.valid?
    assert_includes reply.errors[:parent], 'must belong to the same post'
  end

  test 'reply cannot be nested beneath another reply' do
    parent = create_comment
    reply = create_comment(parent: parent)
    nested_reply = build_comment(parent: reply)

    refute nested_reply.valid?
    assert_includes nested_reply.errors[:parent], 'must be a top-level comment'
  end

  test 'comment cannot be its own parent' do
    comment = create_comment
    comment.parent = comment

    refute comment.valid?
    assert_includes comment.errors[:parent], 'cannot be the comment itself'
  end

  test 'new replies to deleted parents are rejected but existing replies remain editable' do
    parent = create_comment
    reply = create_comment(parent: parent)
    parent.update!(body: nil, user: nil, deleted_at: Time.current)
    new_reply = build_comment(parent: parent)

    refute new_reply.valid?
    assert_includes new_reply.errors[:parent], 'cannot be deleted'
    reply.reload.update!(body: 'Updated reply')
    assert_equal 'Updated reply', reply.reload.body
  end

  private

  def build_comment(**attributes)
    Comment.new({ post: posts(:one), user: users(:one), body: 'A thought' }.merge(attributes))
  end

  def create_comment(**attributes)
    build_comment(**attributes).tap(&:save!)
  end
end
