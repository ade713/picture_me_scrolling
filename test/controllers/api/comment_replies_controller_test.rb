require 'test_helper'

class Api::CommentRepliesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @viewer = User.create!(username: 'reply-reader', password: 'password')
    @parent = Comment.create!(post: posts(:one), user: users(:one), body: 'Parent')
    post api_session_url, params: { user: { username: @viewer.username, password: 'password' } }
  end

  test 'requires authentication for reads and creation' do
    delete api_session_url
    get api_comment_replies_url(@parent)
    assert_response :unauthorized
    assert_no_difference 'Comment.count' do
      post api_comment_replies_url(@parent), params: { comment: { body: 'Reply' } }
    end
    assert_response :unauthorized
  end

  test 'creates a reply using only the supplied body and session identity' do
    assert_difference 'Comment.count', 1 do
      post api_comment_replies_url(@parent), params: {
        comment: { body: 'Hello', user_id: users(:two).id, post_id: posts(:two).id,
                   parent_id: -1, deleted_at: Time.current.iso8601 }
      }
    end
    assert_response :created
    data = response.parsed_body
    reply = Comment.find(data['id'])
    assert_equal @viewer, reply.user
    assert_equal @parent, reply.parent
    assert_equal @parent.post, reply.post
    assert_nil reply.deleted_at
    assert_equal 'Hello', data['body']
    assert_equal @parent.id, data['parent_id']
    assert_equal @viewer.id, data.dig('author', 'id')
    assert_equal 0, data['reply_count']
  end

  test 'reads direct replies beneath a deleted parent without following' do
    replies = 4.times.map { create_reply }
    other = Comment.create!(post: posts(:two), user: users(:one), body: 'Other')
    create_reply(parent: other, post: other.post)
    CommentDeletion.new(comment: @parent).call

    get api_comment_replies_url(@parent)
    assert_response :success
    data = response.parsed_body
    assert_equal replies.last(3).map(&:id), data['comment_ids']
    assert_equal 3, data.dig('pagination', 'per_page')
    assert_equal users(:two).id, data.dig('comments', replies.last.id.to_s, 'author', 'id')
    get api_comment_replies_url(@parent), params: { before: data.dig('pagination', 'next_cursor') }
    assert_response :success
    assert_equal [replies.first.id], response.parsed_body['comment_ids']
    refute response.parsed_body.dig('pagination', 'has_more')
  end

  test 'rejects creation beneath a deleted parent and invalid bodies' do
    ['', 'a' * 1_001].each do |body|
      assert_no_difference 'Comment.count' do
        post api_comment_replies_url(@parent), params: { comment: { body: body } }
      end
      assert_response :unprocessable_entity
    end
    create_reply
    CommentDeletion.new(comment: @parent).call
    assert_no_difference 'Comment.count' do
      post api_comment_replies_url(@parent), params: { comment: { body: 'Too late' } }
    end
    assert_response :unprocessable_entity
    assert_equal ['Parent cannot be deleted'], response.parsed_body
  end

  test 'returns not found for missing parents and reply ids' do
    [-1, create_reply.id].each do |id|
      get api_comment_replies_url(id)
      assert_response :not_found
      assert_no_difference 'Comment.count' do
        post api_comment_replies_url(id), params: { comment: { body: 'Nested' } }
      end
      assert_response :not_found
    end
  end

  test 'returns empty collections and rejects invalid cursors' do
    get api_comment_replies_url(@parent)
    assert_response :success
    assert_equal({}, response.parsed_body['comments'])
    assert_empty response.parsed_body['comment_ids']
    get api_comment_replies_url(@parent), params: { before: 'invalid' }
    assert_response :unprocessable_entity
    assert_equal ['Reply cursor is invalid'], response.parsed_body
  end

  private

  def create_reply(**attributes)
    Comment.create!({ post: @parent.post, parent: @parent, user: users(:two), body: 'Reply' }.merge(attributes))
  end
end
