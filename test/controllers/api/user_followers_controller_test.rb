require 'test_helper'

class Api::UserFollowersControllerTest < ActionDispatch::IntegrationTest
  setup do
    Follow.delete_all
    User.delete_all

    @viewer = create_user('viewer')
    @profile_user = create_user('profile_user')
    @other_follower = create_user('other_follower')
    @unrelated_user = create_user('unrelated_user')
    create_follow(@viewer, @profile_user)
    create_follow(@other_follower, @profile_user)
    create_follow(@viewer, @other_follower)

    login_as(@viewer)
  end

  test 'index requires login' do
    delete api_session_url

    get api_user_followers_url(@profile_user)

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'index returns relationship-aware follower payloads' do
    get api_user_followers_url(@profile_user)

    assert_response :success
    assert_equal [@viewer.id, @other_follower.id].sort, response_user_ids.sort
    refute_includes response_user_ids, @unrelated_user.id
    other_follower_payload = response_users.fetch(@other_follower.id.to_s)
    viewer_payload = response_users.fetch(@viewer.id.to_s)
    assert_equal @other_follower.username, other_follower_payload['username']
    assert_includes other_follower_payload['avatar_url'],
                    File.basename(User::DEFAULT_AVATAR_IMAGE, '.*')
    assert other_follower_payload['followed_by_current_user']
    refute viewer_payload['followed_by_current_user']
    refute other_follower_payload.key?('email')
    refute other_follower_payload.key?('account_settings_enabled')
    assert_equal 2, response_pagination['total_count']
  end

  test 'index passes pagination parameters to the follower query' do
    get api_user_followers_url(@profile_user), params: { page: 2, per_page: 1 }

    assert_response :success
    assert_equal 1, response_user_ids.length
    assert_equal 2, response_pagination['page']
    assert_equal 1, response_pagination['per_page']
  end

  test 'index returns an empty paginated payload when the user has no followers' do
    get api_user_followers_url(@unrelated_user)

    assert_response :success
    assert_equal({}, response_users)
    assert_empty response_user_ids
    assert_equal 0, response_pagination['total_count']
  end

  test 'index returns JSON not found for an unknown user' do
    get api_user_followers_url(user_id: User.maximum(:id) + 1)

    assert_response :not_found
    assert_equal ['User not found'], response_json
  end

  private

  def create_user(username)
    User.create!(username: username, password: 'password')
  end

  def create_follow(follower, followee)
    Follow.create!(follower: follower, followee: followee)
  end

  def login_as(user)
    post api_session_url, params: {
      user: { username: user.username, password: 'password' }
    }
  end

  def response_json
    JSON.parse(response.body)
  end

  def response_users
    response_json['users']
  end

  def response_user_ids
    response_json['user_ids']
  end

  def response_pagination
    response_json['pagination']
  end
end
