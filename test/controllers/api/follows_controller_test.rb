require 'test_helper'

class Api::FollowsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all

    @viewer = User.create!(
      username: 'viewer',
      password: 'password'
    )
    @followee = User.create!(
      username: 'followee',
      password: 'password'
    )
    @viewer_post = Post.create!(
      author_id: @viewer.id,
      title: 'viewer post',
      post_type: 'text'
    )
    @followee_post = Post.create!(
      author_id: @followee.id,
      title: 'followee post',
      post_type: 'text'
    )

    post api_session_url, params: {
      user: {
        username: @viewer.username,
        password: 'password'
      }
    }
  end

  test "create returns feed with followed user's posts" do
    post api_user_follow_url(@followee)

    assert_response :success
    assert_includes response_post_ids, @viewer_post.id.to_s
    assert_includes response_post_ids, @followee_post.id.to_s
  end

  test "destroy returns feed without unfollowed user's posts" do
    Follow.create!(
      follower_id: @viewer.id,
      followee_id: @followee.id
    )

    delete api_user_follow_url(@followee)

    assert_response :success
    assert_includes response_post_ids, @viewer_post.id.to_s
    refute_includes response_post_ids, @followee_post.id.to_s
  end

  private

  def response_post_ids
    JSON.parse(response.body).keys
  end
end
