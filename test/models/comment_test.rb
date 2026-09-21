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
    parent = create_comment(body: nil, user: nil, deleted_at: Time.current)
    reply = create_comment(parent: parent)

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

  private

  def create_comment(**attributes)
    Comment.create!({ post: posts(:one), user: users(:one), body: 'A thought' }.merge(attributes))
  end
end
