require 'test_helper'

class Api::UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all
    ActiveStorage::Attachment.delete_all
    ActiveStorage::Blob.delete_all
  end

  test 'create signs up a user, logs them in, and returns the user payload' do
    assert_difference('User.count', 1) do
      post api_users_url, params: {
        user: {
          username: 'new_user',
          email: ' NEW_USER@Example.COM ',
          password: 'password'
        }
      }
    end

    assert_response :success
    assert_equal 'new_user', response_json['username']
    assert_equal 'new_user@example.com', response_json['email']
    assert_nil response_json['email_verified_at']
    assert response_json['id'].present?
    assert_includes response_json['avatar_url'], default_avatar_name
  end

  test 'create requires an email for a new signup' do
    assert_no_difference('User.count') do
      post api_users_url, params: {
        user: {
          username: 'missing_email_user',
          password: 'password'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_includes response_json, "Email can't be blank"
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
      email: 'existing@example.com',
      password: 'password'
    )

    assert_no_difference('User.count') do
      post api_users_url, params: {
        user: {
          username: 'taken_user',
          email: 'new@example.com',
          password: 'password'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_kind_of Array, response_json
  end

  test 'create returns validation errors for duplicate emails' do
    User.create!(
      username: 'existing_email_user',
      email: 'taken@example.com',
      password: 'password'
    )

    assert_no_difference('User.count') do
      post api_users_url, params: {
        user: {
          username: 'new_username',
          email: ' TAKEN@EXAMPLE.COM ',
          password: 'password'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_includes response_json, 'Email has already been taken'
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
    assert_includes(
      response_json.dig(recommended_user.id.to_s, 'avatar_url'),
      default_avatar_name
    )
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
    assert_includes response_json['avatar_url'], default_avatar_name
    refute response_json.key?('email')
    refute response_json.key?('email_verified_at')
  end

  test 'show prefers an attached avatar over the default profile image' do
    viewer = create_user('viewer')
    user = create_user('visible_user')
    user.avatar.attach(uploaded_avatar)

    login_as(viewer)
    get api_user_url(user)

    assert_response :success
    assert_includes response_json['avatar_url'], 'test-image.svg'
    refute_includes response_json['avatar_url'], default_avatar_name
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

  def uploaded_avatar
    Rack::Test::UploadedFile.new(
      Rails.root.join('test/fixtures/files/test-image.svg'),
      'image/svg+xml'
    )
  end

  def default_avatar_name
    File.basename(User::DEFAULT_AVATAR_IMAGE, '.*')
  end
end
