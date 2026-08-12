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
    @viewer_post.tags << tags(:photography)
    Like.create!(
      user_id: @viewer.id,
      post_id: @followed_post.id
    )
    Like.create!(
      user_id: @unrelated_author.id,
      post_id: @viewer_post.id
    )

    get api_posts_url

    assert_response :success
    assert_includes response_posts.keys, @viewer_post.id.to_s
    assert_includes response_posts.keys, @followed_post.id.to_s
    refute_includes response_posts.keys, @unrelated_post.id.to_s
    assert_equal response_posts.keys.sort, response_post_ids.map(&:to_s).sort
    assert_equal(
      @viewer_post.title,
      response_posts.dig(@viewer_post.id.to_s, 'title')
    )
    assert_equal(
      @followed_author.username,
      response_posts.dig(@followed_post.id.to_s, 'author')
    )
    assert_equal true, response_posts.dig(@followed_post.id.to_s, 'followed')
    assert_equal true, response_posts.dig(@followed_post.id.to_s, 'liked')
    assert_equal 1, response_posts.dig(@followed_post.id.to_s, 'likes')
    assert_equal false, response_posts.dig(@viewer_post.id.to_s, 'followed')
    assert_equal false, response_posts.dig(@viewer_post.id.to_s, 'liked')
    assert_equal 1, response_posts.dig(@viewer_post.id.to_s, 'likes')
    assert_equal ['photography'], response_posts.dig(@viewer_post.id.to_s, 'tags')
  end

  test 'index returns feed posts newest first' do
    shared_timestamp = Time.zone.local(2026, 1, 1, 12, 0, 0)
    @viewer_post.update!(created_at: shared_timestamp)
    @followed_post.update!(created_at: shared_timestamp)

    get api_posts_url

    assert_response :success
    assert_equal [@followed_post.id, @viewer_post.id], response_post_ids
  end

  test 'index paginates feed posts' do
    get api_posts_url, params: { page: 1, per_page: 1 }

    assert_response :success
    assert_equal 1, response_posts.length
    assert_equal [response_post_ids.first], response_posts.keys.map(&:to_i)
    assert_equal 1, response_pagination['page']
    assert_equal 1, response_pagination['per_page']
    assert_equal 2, response_pagination['total_count']
    assert_equal 2, response_pagination['total_pages']
    assert_equal true, response_pagination['has_more']
    first_page_post_id = response_post_ids.first

    get api_posts_url, params: { page: 2, per_page: 1 }

    assert_response :success
    assert_equal 1, response_posts.length
    refute_equal first_page_post_id, response_post_ids.first
    assert_equal 2, response_pagination['page']
    assert_equal false, response_pagination['has_more']
  end

  test 'index filters accessible posts by tag before pagination' do
    @viewer_post.tags << tags(:photography)
    @followed_post.tags << tags(:sunset)
    @unrelated_post.tags << tags(:photography)

    get api_posts_url, params: { tag: ' Photography ', per_page: 1 }

    assert_response :success
    assert_equal [@viewer_post.id], response_post_ids
    assert_equal [@viewer_post.id.to_s], response_posts.keys
    assert_equal 1, response_pagination['total_count']
    assert_equal 1, response_pagination['total_pages']
    assert_equal false, response_pagination['has_more']
  end

  test 'index returns an empty paginated feed for a nonexistent tag' do
    get api_posts_url, params: { tag: 'nonexistent' }

    assert_response :success
    assert_empty response_post_ids
    assert_equal({}, response_posts)
    assert_equal 0, response_pagination['total_count']
    assert_equal 0, response_pagination['total_pages']
    assert_equal false, response_pagination['has_more']
  end

  test 'index rejects a malformed tag filter' do
    get api_posts_url, params: { tag: 'invalid-tag' }

    assert_response :unprocessable_entity
    assert_equal [FeedQuery::INVALID_TAG_ERROR], response_json
  end

  test 'show returns the requested post payload' do
    @followed_post.tags << tags(:sunset)
    @followed_post.tags << tags(:photography)

    get api_post_url(@followed_post)

    assert_response :success
    assert_equal @followed_post.id, response_json['id']
    assert_equal @followed_post.title, response_json['title']
    assert_equal @followed_author.username, response_json['author']
    assert_equal true, response_json['followed']
    assert_equal false, response_json['liked']
    assert_equal 0, response_json['likes']
    assert response_json.key?('image_url')
    assert_includes response_json['author_avatar'], default_avatar_name
    assert_equal %w[photography sunset], response_json['tags']
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
    assert_empty response_json['tags']
  end

  test 'create adds normalized unique tags to a post' do
    assert_difference(['Post.count', 'Tag.count'], 1) do
      post api_posts_url, params: {
        post: {
          title: 'tagged post',
          body: 'new body',
          post_type: 'text',
          tags: [' Cityscape ', 'cityscape']
        }
      }
    end

    assert_response :success
    assert_equal ['cityscape'], Post.find(response_json['id']).tags.pluck(:name)
    assert_equal ['cityscape'], response_json['tags']
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
    assert_equal ["Title can't be blank"], response_json
  end

  test 'create returns tag validation errors without persisting the post' do
    assert_no_difference(['Post.count', 'Tag.count', 'PostTag.count']) do
      post api_posts_url, params: {
        post: {
          title: 'invalid tags',
          body: 'new body',
          post_type: 'text',
          tags: ['valid_tag', 'invalid-tag']
        }
      }
    end

    assert_response :unprocessable_entity
    assert_equal ['Name is invalid'], response_json
  end

  test 'create rejects more than five unique tags' do
    assert_no_difference(['Post.count', 'Tag.count', 'PostTag.count']) do
      post api_posts_url, params: {
        post: {
          title: 'too many tags',
          body: 'new body',
          post_type: 'text',
          tags: %w[one two three four five six]
        }
      }
    end

    assert_response :unprocessable_entity
    assert_equal ['Posts can have up to 5 tags'], response_json
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

  test 'update replaces tags on a current user post' do
    @viewer_post.tags << tags(:photography)

    patch api_post_url(@viewer_post), params: {
      post: {
        title: 'updated title',
        tags: [' Sunset ', 'travel']
      }
    }

    assert_response :success
    assert_equal %w[sunset travel], @viewer_post.reload.tags.order(:name).pluck(:name)
    assert_equal %w[sunset travel], response_json['tags']
  end

  test 'update removes all tags when given an empty array' do
    @viewer_post.tags << tags(:photography)

    patch api_post_url(@viewer_post), params: {
      post: {
        title: 'updated title',
        tags: []
      }
    }, as: :json

    assert_response :success
    assert_empty @viewer_post.reload.tags
  end

  test 'update preserves tags when they are omitted' do
    @viewer_post.tags << tags(:photography)

    patch api_post_url(@viewer_post), params: {
      post: {
        title: 'updated title'
      }
    }

    assert_response :success
    assert_equal ['photography'], @viewer_post.reload.tags.pluck(:name)
  end

  test 'update returns tag errors without changing the post or its tags' do
    @viewer_post.tags << tags(:photography)

    patch api_post_url(@viewer_post), params: {
      post: {
        title: 'should not persist',
        tags: ['invalid-tag']
      }
    }

    assert_response :unprocessable_entity
    assert_equal ['Name is invalid'], response_json
    assert_equal 'viewer post', @viewer_post.reload.title
    assert_equal ['photography'], @viewer_post.tags.pluck(:name)
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

  test 'update returns validation errors for invalid owned posts' do
    patch api_post_url(@viewer_post), params: {
      post: {
        title: ''
      }
    }

    assert_response :unprocessable_entity
    assert_equal ["Title can't be blank"], response_json
    assert_equal 'viewer post', @viewer_post.reload.title
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

  def response_posts
    response_json['posts']
  end

  def response_post_ids
    response_json['post_ids']
  end

  def response_pagination
    response_json['pagination']
  end

  def uploaded_image
    Rack::Test::UploadedFile.new(
      Rails.root.join('test/fixtures/files/test-image.svg'),
      'image/svg+xml'
    )
  end

  def default_avatar_name
    File.basename(User::DEFAULT_AVATAR_IMAGE, '.*')
  end
end
