require 'test_helper'

class Api::PostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all
    ActiveStorage::Attachment.delete_all
    ActiveStorage::Blob.delete_all

    @viewer = create_user('viewer')
    @followed_author = create_user('followed_author')
    @unrelated_author = create_user('unrelated_author')

    @viewer_post = create_post(
      author: @viewer,
      title: 'viewer post',
      body: 'owned by viewer'
    )
    @followed_post = create_post(
      author: @followed_author,
      title: 'followed post',
      body: 'owned by followed author'
    )
    @unrelated_post = create_post(
      author: @unrelated_author,
      title: 'unrelated post',
      body: 'not in viewer feed'
    )

    Follow.create!(
      follower_id: @viewer.id,
      followee_id: @followed_author.id
    )

    login_as(@viewer)
  end

  test 'index requires login' do
    delete api_session_url

    get api_posts_url

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'index returns current user and followed user posts' do
    get api_posts_url

    assert_response :success
    assert_includes response_json.keys, @viewer_post.id.to_s
    assert_includes response_json.keys, @followed_post.id.to_s
    refute_includes response_json.keys, @unrelated_post.id.to_s
    assert_equal(
      @viewer_post.title,
      response_json.dig(@viewer_post.id.to_s, 'title')
    )
    assert_equal(
      @followed_author.username,
      response_json.dig(@followed_post.id.to_s, 'author')
    )
  end

  test 'show returns the requested post payload' do
    get api_post_url(@followed_post)

    assert_response :success
    assert_equal @followed_post.id, response_json['id']
    assert_equal @followed_post.title, response_json['title']
    assert_equal @followed_author.username, response_json['author']
    assert_equal true, response_json['followed']
    assert_equal false, response_json['liked']
    assert_equal 0, response_json['likes']
    assert response_json.key?('image_url')
    assert response_json.key?('author_avatar')
  end

  test 'create requires login' do
    delete api_session_url

    assert_no_difference('Post.count') do
      post api_posts_url, params: {
        post: {
          title: 'new post',
          body: 'new body',
          post_type: 'text'
        }
      }
    end

    assert_response :unauthorized
    assert_equal ['You must be logged in'], response_json
  end

  test 'create adds a post for the current user and returns the post payload' do
    assert_difference('Post.count', 1) do
      post api_posts_url, params: {
        post: {
          title: 'new post',
          body: 'new body',
          post_type: 'text'
        }
      }
    end

    assert_response :success
    assert_equal 'new post', response_json['title']
    assert_equal 'new body', response_json['body']
    assert_equal 'text', response_json['post_type']
    assert_equal @viewer.id, response_json['author_id']
    assert_equal @viewer.username, response_json['author']
  end

  test 'create attaches uploaded media and returns an image URL' do
    assert_difference('Post.count', 1) do
      assert_difference('ActiveStorage::Attachment.count', 1) do
        assert_difference('ActiveStorage::Blob.count', 1) do
          post api_posts_url, params: {
            post: {
              title: 'new photo post',
              post_type: 'photo',
              image: uploaded_image
            }
          }
        end
      end
    end

    created_post = Post.order(:created_at).last

    assert_response :success
    assert created_post.image.attached?
    assert_equal created_post.id, response_json['id']
    assert_equal 'new photo post', response_json['title']
    assert_equal 'photo', response_json['post_type']
    assert response_json['image_url'].present?
  end

  test 'create returns validation errors for invalid params' do
    assert_no_difference('Post.count') do
      post api_posts_url, params: {
        post: {
          title: '',
          body: 'missing title',
          post_type: 'text'
        }
      }
    end

    assert_response :unprocessable_entity
    assert_equal ['Unable to create post, check title/caption input'], response_json
  end

  test 'update changes a current user post and returns the post payload' do
    patch api_post_url(@viewer_post), params: {
      post: {
        title: 'updated title',
        body: 'updated body'
      }
    }

    assert_response :success
    assert_equal 'updated title', response_json['title']
    assert_equal 'updated body', response_json['body']
  end

  test 'update attaches uploaded media to a current user post' do
    assert_difference('ActiveStorage::Attachment.count', 1) do
      assert_difference('ActiveStorage::Blob.count', 1) do
        patch api_post_url(@viewer_post), params: {
          post: {
            title: 'updated photo title',
            post_type: 'photo',
            image: uploaded_image
          }
        }
      end
    end

    assert_response :success
    assert @viewer_post.reload.image.attached?
    assert_equal 'updated photo title', response_json['title']
    assert_equal 'photo', response_json['post_type']
    assert response_json['image_url'].present?
  end

  test 'update rejects posts owned by another user' do
    patch api_post_url(@followed_post), params: {
      post: {
        title: 'bad update'
      }
    }

    assert_response :unprocessable_entity
    assert_equal ['Post must belong to user to edit'], response_json
    assert_equal 'followed post', @followed_post.reload.title
  end

  test 'destroy removes a current user post and returns the deleted post payload' do
    assert_difference('Post.count', -1) do
      delete api_post_url(@viewer_post)
    end

    assert_response :success
    assert_equal @viewer_post.id, response_json['id']
    assert_equal @viewer_post.title, response_json['title']
  end

  test 'destroy rejects posts owned by another user' do
    assert_no_difference('Post.count') do
      delete api_post_url(@followed_post)
    end

    assert_response :unprocessable_entity
    assert_equal ['Post must belong to user to delete'], response_json
  end

  test 'post attachments do not depend on legacy Paperclip columns' do
    refute_includes Post.column_names, 'image_file_name'
    refute_includes Post.column_names, 'image_content_type'
    refute_includes Post.column_names, 'image_file_size'
    refute_includes Post.column_names, 'image_updated_at'
  end

  private

  def create_user(username)
    User.create!(
      username: username,
      password: 'password'
    )
  end

  def create_post(author:, title:, body:)
    Post.create!(
      author_id: author.id,
      title: title,
      body: body,
      post_type: 'text'
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

  def uploaded_image
    Rack::Test::UploadedFile.new(
      Rails.root.join('test/fixtures/files/test-image.svg'),
      'image/svg+xml'
    )
  end
end
