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

  private

  def response_json
    JSON.parse(response.body)
  end
end
