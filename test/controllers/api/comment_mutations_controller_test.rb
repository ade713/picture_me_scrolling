require 'test_helper'

class Api::CommentMutationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @author = User.create!(username: 'comment-author', password: 'password')
    @post = Post.create!(author: @author, title: 'Discussion', post_type: Post::TYPES[:text])
    @comment = Comment.create!(post: @post, user: @author, body: 'Original')
    post api_session_url, params: { user: { username: @author.username, password: 'password' } }
  end

  test 'editing changes only body and returns the current reply count' do
    reply = Comment.create!(post: @post, user: users(:one), parent: @comment, body: 'Reply')

    patch api_comment_url(@comment), params: {
      comment: { body: 'Edited', user_id: users(:one).id, post_id: posts(:one).id,
                 parent_id: reply.id, deleted_at: Time.current.iso8601 }
    }

    assert_response :success
    assert_equal 'Edited', @comment.reload.body
    assert_equal @author, @comment.user
    assert_equal @post, @comment.post
    assert_nil @comment.parent_id
    assert_nil @comment.deleted_at
    assert_equal 'Edited', response.parsed_body['body']
    assert_equal 1, response.parsed_body['reply_count']
  end

  test 'invalid edits preserve the saved body' do
    [
      [" \n", "Body can't be blank"],
      ['a' * 1_001, 'Body is too long (maximum is 1000 characters)']
    ].each do |body, expected_error|
      patch api_comment_url(@comment), params: { comment: { body: body } }

      assert_response :unprocessable_entity
      assert_equal [expected_error], response.parsed_body
      assert_equal 'Original', @comment.reload.body
    end
  end

  test 'deleting a childless comment removes it and returns no content' do
    assert_difference 'Comment.count', -1 do
      delete api_comment_url(@comment)
    end

    assert_response :no_content
    assert_empty response.body
  end

  test 'deleting a parent preserves replies under an anonymous placeholder' do
    reply = Comment.create!(post: @post, user: users(:one), parent: @comment, body: 'Reply')

    delete api_comment_url(@comment)

    assert_response :no_content
    assert @comment.reload.deleted?
    assert_nil @comment.body
    assert_nil @comment.user_id
    assert_equal 'Reply', reply.reload.body

    assert_mutations_not_found(@comment)
  end

  test 'existing replies can be edited and deleted beneath a deleted parent' do
    parent = Comment.create!(post: @post, user: users(:one), body: 'Parent')
    reply = Comment.create!(post: @post, user: @author, parent: parent, body: 'Reply')
    CommentDeletion.new(comment: parent).call

    patch api_comment_url(reply), params: { comment: { body: 'Edited reply' } }
    assert_response :success
    assert_equal 'Edited reply', reply.reload.body

    delete api_comment_url(reply)
    assert_response :no_content
    refute Comment.exists?(reply.id)
    refute Comment.exists?(parent.id)
  end

  test 'post ownership does not permit mutating another authors comment' do
    other = Comment.create!(post: @post, user: users(:one), body: 'Someone else')

    assert_mutations_not_found(other)

    assert_equal 'Someone else', other.reload.body
    refute other.deleted?
  end

  test 'unknown comments return JSON not found' do
    assert_mutations_not_found(-1)
  end

  test 'mutations require authentication' do
    delete api_session_url

    patch api_comment_url(@comment), params: { comment: { body: 'Unauthorized' } }
    assert_response :unauthorized
    delete api_comment_url(@comment)
    assert_response :unauthorized
    assert_equal 'Original', @comment.reload.body
  end

  private

  def assert_mutations_not_found(comment)
    patch api_comment_url(comment), params: { comment: { body: 'Unauthorized' } }
    assert_response :not_found
    assert_equal ['Comment not found'], response.parsed_body

    delete api_comment_url(comment)
    assert_response :not_found
    assert_equal ['Comment not found'], response.parsed_body
  end
end
