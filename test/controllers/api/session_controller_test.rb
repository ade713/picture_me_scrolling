require 'test_helper'

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all

    @user = User.create!(
      username: 'session_user',
      password: 'password'
    )
  end

  test 'create logs in a user and returns the user payload' do
    post api_session_url, params: {
      user: {
        username: @user.username,
        password: 'password'
      }
    }

    assert_response :success
    assert_equal @user.id, response_json['id']
    assert_equal @user.username, response_json['username']
    assert response_json.key?('avatar_url')
  end

  test 'create returns unauthorized for invalid credentials' do
    post api_session_url, params: {
      user: {
        username: @user.username,
        password: 'wrong-password'
      }
    }

    assert_response :unauthorized
    assert_equal ['Invalid username or password'], response_json
  end

  test 'authenticated session can access protected API endpoints' do
    login_as(@user)

    get api_users_url

    assert_response :success
  end

  test 'destroy logs out the current user and returns the user payload' do
    login_as(@user)

    delete api_session_url

    assert_response :success
    assert_equal @user.id, response_json['id']
    assert_equal @user.username, response_json['username']
  end

  test 'destroy returns not found without a current user' do
    delete api_session_url

    assert_response :not_found
    assert_equal ['No current user present'], response_json
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
