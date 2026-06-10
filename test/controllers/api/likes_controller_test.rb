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
    @other_user = User.create!(
      username: 'other_user',
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
    assert_equal 1, response_json['likes']
    assert_post_payload_fields
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
    assert_equal 0, response_json['likes']
    assert_post_payload_fields
  end

  test 'destroy returns not found when the like does not exist' do
    assert_no_difference('Like.count') do
      delete api_post_like_url(@post)
    end

    assert_response :not_found
    assert_equal ['Like not found'], response_json
  end

  test "destroy does not remove another user's like" do
    Like.create!(user: @other_user, post: @post)

    assert_no_difference('Like.count') do
      delete api_post_like_url(@post)
    end

    assert_response :not_found
    assert_equal ['Like not found'], response_json
    assert @post.likers.exists?(@other_user.id)
  end

  test 'create requires login' do
    delete api_session_url

    assert_no_difference('Like.count') do
      post api_post_like_url(@post)
    end

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'destroy requires login' do
    Like.create!(user: @viewer, post: @post)
    delete api_session_url

    assert_no_difference('Like.count') do
      delete api_post_like_url(@post)
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

  def assert_post_payload_fields
    assert_equal @post.title, response_json['title']
    assert_equal @post.author_id, response_json['author_id']
    assert_equal @author.username, response_json['author']
    assert_equal false, response_json['followed']
    assert response_json.key?('body')
    assert response_json.key?('post_type')
    assert response_json.key?('url')
    assert response_json.key?('image_url')
    assert response_json.key?('author_avatar')
  end
end
