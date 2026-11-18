require 'test_helper'

class CommentDeletionTest < ActiveSupport::TestCase
  test 'deletes a childless comment outright' do
    comment = create_comment

    delete_comment(comment)

    refute Comment.exists?(comment.id)
  end

  test 'erases parent identity and body while retaining other authors replies' do
    parent = create_comment
    reply = create_comment(parent: parent, user: users(:two))

    delete_comment(parent)

    parent.reload
    assert parent.deleted?
    assert_nil parent.body
    assert_nil parent.user_id
    assert_equal parent, reply.reload.parent
    assert_equal 'A reply', reply.body
    assert_equal users(:two), reply.user
  end

  test 'keeps a placeholder until its final reply is deleted' do
    parent = create_comment
    first = create_comment(parent: parent)
    last = create_comment(parent: parent)
    delete_comment(parent)

    delete_comment(first)
    assert Comment.exists?(parent.id)

    delete_comment(last)
    refute Comment.exists?(parent.id)
    refute Comment.exists?(last.id)
  end

  test 'deleting the last reply does not delete an active parent' do
    parent = create_comment
    reply = create_comment(parent: parent)

    delete_comment(reply)

    assert Comment.exists?(parent.id)
  end

  test 'user deletion erases their comments without removing other authors replies' do
    author = User.create!(username: 'departing-commenter', password: 'password')
    parent = create_comment(user: author)
    own_reply = create_comment(parent: parent, user: author)
    other_reply = create_comment(parent: parent, user: users(:two))
    childless = create_comment(user: author)

    author.destroy!

    assert parent.reload.deleted?
    assert_nil parent.body
    assert_nil parent.user_id
    assert Comment.exists?(other_reply.id)
    refute Comment.exists?(own_reply.id)
    refute Comment.exists?(childless.id)
    refute User.exists?(author.id)
  end

  test 'post deletion removes the discussion including placeholders but not another post' do
    parent = create_comment
    reply = create_comment(parent: parent)
    delete_comment(parent)
    unrelated = create_comment(post: posts(:two))

    posts(:one).delete

    refute Comment.exists?(parent.id)
    refute Comment.exists?(reply.id)
    assert Comment.exists?(unrelated.id)
  end

  test 'reply with cached parent is rejected after parent deletion' do
    parent = create_comment
    create_comment(parent: parent)
    draft = Comment.new(post: parent.post, user: users(:two), parent: parent, body: 'Late reply')
    assert draft.valid?
    delete_comment(Comment.find(parent.id))

    refute draft.save
    assert_includes draft.errors[:parent], 'cannot be deleted'
  end

  test 'stale update cannot restore content after deletion' do
    parent = create_comment
    create_comment(parent: parent)
    stale = Comment.find(parent.id)
    delete_comment(parent)

    refute stale.update(body: 'Restored content')
    assert_includes stale.errors[:base], 'cannot update a deleted comment'
    assert_nil parent.reload.body
  end

  test 'failure rolls back placeholder changes' do
    parent = create_comment
    create_comment(parent: parent)

    Comment.transaction do
      delete_comment(parent)
      raise ActiveRecord::Rollback
    end

    refute parent.reload.deleted?
    assert_equal 'A reply', parent.body
    assert_equal users(:one), parent.user
  end

  test 'deleted placeholders cannot acquire content or an author again' do
    parent = create_comment
    create_comment(parent: parent)
    delete_comment(parent)

    refute parent.update(body: 'Restored', user: users(:one))
    assert_includes parent.errors[:body], 'must be blank'
    assert_includes parent.errors[:user], 'must be blank'
    assert_nil parent.reload.body
    assert_nil parent.user_id
  end

  private

  def create_comment(**attributes)
    Comment.create!({ post: posts(:one), user: users(:one), body: 'A reply' }.merge(attributes))
  end

  def delete_comment(comment)
    CommentDeletion.new(comment: comment).call
  end
end
