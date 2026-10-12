require 'test_helper'

class Api::CommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @viewer = User.create!(username: 'comment-reader', password: 'password')
    post api_session_url, params: { user: { username: @viewer.username, password: 'password' } }
  end

  test 'requires authentication' do
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
