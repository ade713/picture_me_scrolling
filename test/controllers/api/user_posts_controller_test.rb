require 'test_helper'

class Api::UserPostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    PostTag.delete_all
    Post.delete_all
    User.delete_all

    @viewer = create_user('viewer')
    @profile_user = create_user('profile_user')
    @other_user = create_user('other_user')
    @older_post = create_post(@profile_user, 'older post')
    @newer_post = create_post(@profile_user, 'newer post')
    @other_post = create_post(@other_user, 'other post')

    login_as(@viewer)
  end

  test 'index requires login' do
    delete api_session_url

    get api_user_posts_url(@profile_user)

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'index returns serialized posts for the requested user' do
    @newer_post.tags << tags(:photography)
    Like.create!(user: @viewer, post: @newer_post)

    get api_user_posts_url(@profile_user)

    assert_response :success
    assert_equal [@newer_post.id, @older_post.id].sort, response_post_ids.sort
    refute_includes response_post_ids, @other_post.id
    assert_equal @profile_user.username,
                 response_posts.dig(@newer_post.id.to_s, 'author')
    assert_equal ['photography'],
                 response_posts.dig(@newer_post.id.to_s, 'tags')
    assert response_posts.dig(@newer_post.id.to_s, 'liked')
    refute response_posts.dig(@newer_post.id.to_s, 'followed')
    assert_equal 2, response_pagination['total_count']
  end

  test 'index passes pagination parameters to the profile post query' do
    get api_user_posts_url(@profile_user), params: { page: 2, per_page: 1 }

    assert_response :success
    assert_equal [@older_post.id], response_post_ids
    assert_equal 2, response_pagination['page']
    assert_equal 1, response_pagination['per_page']
  end

  test 'index passes the tag parameter to the profile post query' do
    @older_post.tags << tags(:photography)
    @newer_post.tags << tags(:sunset)
    @other_post.tags << tags(:photography)

    get api_user_posts_url(@profile_user), params: { tag: ' Photography ' }

    assert_response :success
    assert_equal [@older_post.id], response_post_ids
  end

  test 'index returns an empty paginated result when no posts match' do
    get api_user_posts_url(@profile_user), params: { tag: 'nonexistent' }

    assert_response :success
    assert_equal({}, response_posts)
    assert_empty response_post_ids
    assert_equal 0, response_pagination['total_count']
  end

  test 'index rejects a malformed tag filter' do
    get api_user_posts_url(@profile_user), params: { tag: 'invalid-tag' }

    assert_response :unprocessable_entity
    assert_equal ['Tag filter is invalid'], response_json
  end

  test 'index returns JSON not found for an unknown user' do
    get api_user_posts_url(user_id: User.maximum(:id) + 1)

    assert_response :not_found
    assert_equal ['User not found'], response_json
  end

  private

  def create_user(username)
    User.create!(username: username, password: 'password')
  end

  def create_post(author, title)
    Post.create!(author: author, title: title, post_type: 'text')
  end

  def login_as(user)
    post api_session_url, params: {
      user: { username: user.username, password: 'password' }
    }
  end

  def response_json
    JSON.parse(response.body)
  end

  def response_posts
    response_json['posts']
  end

  def response_post_ids
    response_json['post_ids']
  end

  def response_pagination
    response_json['pagination']
  end
end
