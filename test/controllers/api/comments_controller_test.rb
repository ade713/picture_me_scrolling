require 'test_helper'

class Api::CommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @viewer = User.create!(username: 'comment-reader', password: 'password')
    post api_session_url, params: { user: { username: @viewer.username, password: 'password' } }
  end

  test 'creation requires authentication' do
    delete api_session_url

    assert_no_difference 'Comment.count' do
      post api_post_comments_url(posts(:one)), params: { comment: { body: 'Hello' } }
    end

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response.parsed_body
  end

  test 'creates and serializes a top-level comment without following the post author' do
    assert_no_difference 'Follow.count' do
      assert_difference 'Comment.count', 1 do
        post api_post_comments_url(posts(:one)), params: { comment: { body: 'My comment' } }
      end
    end

    assert_response :created
    data = response.parsed_body
    comment = Comment.find(data['id'])
    assert_equal @viewer, comment.user
    assert_equal posts(:one), comment.post
    assert_nil comment.parent_id
    assert_equal 'My comment', data['body']
    assert_equal @viewer.id, data.dig('author', 'id')
    assert_equal %w[avatar_url id username], data['author'].keys.sort
    assert_equal 0, data['reply_count']
    refute data['deleted']
    assert_not_nil data['created_at']

    get api_post_comments_url(posts(:one))
    assert_response :success
    assert_equal data, response.parsed_body['comments'][comment.id.to_s]
  end

  test 'ignores client-supplied identity, parent, and deletion attributes' do
    parent = Comment.create!(post: posts(:one), user: users(:one), body: 'Parent')

    post api_post_comments_url(posts(:one)), params: {
      comment: { body: 'Safe', user_id: users(:two).id, post_id: posts(:two).id,
                 parent_id: parent.id, deleted_at: Time.current.iso8601 }
    }

    assert_response :created
    comment = Comment.find(response.parsed_body['id'])
    assert_equal @viewer, comment.user
    assert_equal posts(:one), comment.post
    assert_nil comment.parent_id
    assert_nil comment.deleted_at
  end

  test 'returns validation errors without persisting invalid comments' do
    [
      [" \n\t", "Body can't be blank"],
      ['a' * 1_001, 'Body is too long (maximum is 1000 characters)']
    ].each do |body, expected_error|
      assert_no_difference 'Comment.count' do
        post api_post_comments_url(posts(:one)), params: { comment: { body: body } }
      end

      assert_response :unprocessable_entity
      assert_equal [expected_error], response.parsed_body
    end
  end

  test 'creation returns not found for an unknown post' do
    assert_no_difference 'Comment.count' do
      post api_post_comments_url(post_id: -1), params: { comment: { body: 'Hello' } }
    end

    assert_response :not_found
    assert_equal ['Post not found'], response.parsed_body
  end

  test 'index requires authentication' do
    delete api_session_url
    get api_post_comments_url(posts(:one))
    assert_response :unauthorized
  end

  test 'returns public author details and anonymous placeholders without following' do
    parent = Comment.create!(post: posts(:one), user: users(:one), body: 'Removed')
    Comment.create!(post: posts(:one), user: users(:two), parent: parent, body: 'Reply')
    CommentDeletion.new(comment: parent).call
    active = Comment.create!(post: posts(:one), user: users(:two), body: 'Visible')

    get api_post_comments_url(posts(:one))

    assert_response :success
    data = response.parsed_body
    assert_equal [parent.id, active.id], data['comment_ids']
    placeholder = data['comments'][parent.id.to_s]
    assert placeholder['deleted']
    assert_nil placeholder['author']
    assert_nil placeholder['body']
    assert_equal 1, placeholder['reply_count']
    serialized = data['comments'][active.id.to_s]
    assert_equal 'Visible', serialized['body']
    assert_equal 0, serialized['reply_count']
    assert_equal %w[avatar_url id username], serialized['author'].keys.sort
    assert_equal users(:two).id, serialized['author']['id']
  end

  test 'passes cursor and page size to the query' do
    comments = 2.times.map { Comment.create!(post: posts(:one), user: users(:one), body: 'Hello') }
    get api_post_comments_url(posts(:one)), params: { per_page: 1 }
    assert_response :success
    data = response.parsed_body
    assert_equal [comments.first.id], data['comment_ids']

    get api_post_comments_url(posts(:one)), params: { after: data.dig('pagination', 'next_cursor'), per_page: 1 }
    assert_response :success
    assert_equal [comments.last.id], response.parsed_body['comment_ids']
  end

  test 'returns an empty collection' do
    get api_post_comments_url(posts(:one))
    assert_response :success
    assert_equal({}, response.parsed_body['comments'])
    assert_empty response.parsed_body['comment_ids']
  end

  test 'returns JSON errors for unknown posts and malformed cursors' do
    get api_post_comments_url(post_id: -1)
    assert_response :not_found
    assert_equal ['Post not found'], response.parsed_body

    get api_post_comments_url(posts(:one)), params: { after: 'invalid' }
    assert_response :unprocessable_entity
    assert_equal ['Comment cursor is invalid'], response.parsed_body
  end
end
