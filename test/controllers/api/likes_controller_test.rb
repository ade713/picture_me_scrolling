require 'test_helper'

class Api::LikesControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all

    @viewer = User.create!(
      username: 'viewer',
      password: 'password'
    )
    @author = User.create!(
      username: 'author',
      password: 'password'
    )
    @post = Post.create!(
      author_id: @author.id,
      title: 'post to like',
      post_type: 'text'
    )

    login_as(@viewer)
  end

  test 'create likes a post and returns the post payload' do
    assert_difference('Like.count', 1) do
      post api_post_like_url(@post)
    end

    assert_response :success
    assert_equal @post.id, response_json['id']
    assert_equal true, response_json['liked']
  end

  test 'create returns validation errors for a duplicate like' do
    Like.create!(user: @viewer, post: @post)

    assert_no_difference('Like.count') do
      post api_post_like_url(@post)
    end

    assert_response :unprocessable_entity
    assert_kind_of Array, response_json
  end

  test 'create returns not found for a missing post' do
    assert_no_difference('Like.count') do
      post api_post_like_url(0)
    end

    assert_response :not_found
    assert_equal ['Post not found'], response_json
  end

  test 'destroy unlikes a post and returns the post payload' do
    Like.create!(user: @viewer, post: @post)

    assert_difference('Like.count', -1) do
      delete api_post_like_url(@post)
    end

    assert_response :success
    assert_equal @post.id, response_json['id']
    assert_equal false, response_json['liked']
  end

  test 'destroy returns not found when the like does not exist' do
    assert_no_difference('Like.count') do
      delete api_post_like_url(@post)
    end

    assert_response :not_found
    assert_equal ['Like not found'], response_json
  end

  test 'create requires login' do
    delete api_session_url

    assert_no_difference('Like.count') do
      post api_post_like_url(@post)
    end

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  private

  def login_as(user)
    post api_session_url, params: {
      user: {
        username: user.username,
        password: 'password'
      }
    }
  end

  def response_json
    JSON.parse(response.body)
  end
end
