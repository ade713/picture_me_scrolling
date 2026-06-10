require 'test_helper'

class Api::UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all
  end

  test 'create signs up a user, logs them in, and returns the user payload' do
    assert_difference('User.count', 1) do
      post api_users_url, params: {
        user: {
          username: 'new_user',
          password: 'password'
        }
      }
    end

    assert_response :success
    assert_equal 'new_user', response_json['username']
    assert response_json['id'].present?
    assert response_json.key?('avatar_url')
  end

  test 'create returns validation errors for invalid signup params' do
    assert_no_difference('User.count') do
      post api_users_url, params: {
        user: {
          username: '',
          password: 'short'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_kind_of Array, response_json
  end

  test 'create returns validation errors for duplicate usernames' do
    User.create!(
      username: 'taken_user',
      password: 'password'
    )

    assert_no_difference('User.count') do
      post api_users_url, params: {
        user: {
          username: 'taken_user',
          password: 'password'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_kind_of Array, response_json
  end

  test 'index requires login' do
    get api_users_url

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'index returns recommended users excluding current and followed users' do
    viewer = create_user('viewer')
    followed_user = create_user('followed_user')
    recommended_user = create_user('recommended_user')

    Follow.create!(
      follower_id: viewer.id,
      followee_id: followed_user.id
    )

    login_as(viewer)
    get api_users_url

    assert_response :success
    assert_includes response_json.keys, recommended_user.id.to_s
    refute_includes response_json.keys, viewer.id.to_s
    refute_includes response_json.keys, followed_user.id.to_s
    assert_equal(
      recommended_user.username,
      response_json.dig(recommended_user.id.to_s, 'username')
    )
    assert response_json.dig(recommended_user.id.to_s).key?('avatar_url')
  end

  test 'show requires login' do
    user = create_user('visible_user')

    get api_user_url(user)

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'show returns the requested user payload' do
    viewer = create_user('viewer')
    user = create_user('visible_user')

    login_as(viewer)
    get api_user_url(user)

    assert_response :success
    assert_equal user.id, response_json['id']
    assert_equal user.username, response_json['username']
    assert response_json.key?('avatar_url')
  end

  private

  def create_user(username)
    User.create!(
      username: username,
      password: 'password'
    )
  end

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
