require 'test_helper'

class Api::AccountsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    User.delete_all
    ActiveStorage::Attachment.delete_all
    ActiveStorage::Blob.delete_all

    @user = create_user('account_user')
    @tempfiles = []
  end

  teardown do
    @tempfiles.each(&:close!)
  end

  test 'account endpoints require login' do
    patch avatar_api_account_url, params: { avatar: square_avatar }
    assert_response :unauthorized

    patch password_api_account_url, params: password_params
    assert_response :unauthorized
  end

  test 'password update requires the current password' do
    login_as(@user)
    patch password_api_account_url, params: password_params(current_password: 'wrong-password')

    assert_response :unprocessable_entity
    assert_equal ['Current password is incorrect'], response_json
    assert @user.reload.is_password?('password')
  end

  test 'password update requires matching confirmation' do
    login_as(@user)
    patch password_api_account_url, params: password_params(password_confirmation: 'different-password')

    assert_response :unprocessable_entity
    assert_equal ["Password confirmation doesn't match password"], response_json
    assert @user.reload.is_password?('password')
  end

  test 'password update enforces minimum and bcrypt byte limits' do
    login_as(@user)

    patch password_api_account_url, params: password_params(password: 'short', password_confirmation: 'short')
    assert_response :unprocessable_entity
    assert_includes response_json, 'Password is too short (minimum is 6 characters)'

    oversized_password = 'a' * (User::MAXIMUM_PASSWORD_BYTES + 1)
    patch password_api_account_url,
          params: password_params(password: oversized_password, password_confirmation: oversized_password)

    assert_response :unprocessable_entity
    assert_includes response_json,
                    "Password is too long (maximum is #{User::MAXIMUM_PASSWORD_BYTES} bytes)"
    assert @user.reload.is_password?('password')
  end

  test 'password update changes credentials and retains the current session' do
    login_as(@user)
    session_token = @user.reload.session_token

    patch password_api_account_url, params: password_params

    assert_response :success
    assert_equal @user.id, response_json['id']
    assert response_json['account_settings_enabled']
    assert @user.reload.is_password?('new-password')
    refute @user.is_password?('password')
    assert_equal session_token, @user.session_token

    get api_users_url
    assert_response :success
  end

  test 'avatar update attaches a valid square raster image' do
    login_as(@user)
    patch avatar_api_account_url, params: { avatar: square_avatar }

    assert_response :success
    assert @user.reload.avatar.attached?
    assert_equal 'profile_blue_150x150.png', @user.avatar.filename.to_s
    assert_includes response_json['avatar_url'], 'profile_blue_150x150.png'
  end

  test 'avatar update requires an image' do
    login_as(@user)
    patch avatar_api_account_url

    assert_response :unprocessable_entity
    assert_equal ['Avatar is required'], response_json
  end

  test 'avatar update rejects unsupported and unreadable content' do
    login_as(@user)

    patch avatar_api_account_url, params: { avatar: svg_avatar }
    assert_response :unprocessable_entity
    assert_includes response_json, 'Avatar must be a JPEG, PNG, WebP, or GIF image'

    patch avatar_api_account_url, params: { avatar: unreadable_avatar }
    assert_response :unprocessable_entity
    assert_equal ['Avatar must be a readable JPEG, PNG, WebP, or GIF image'], response_json
    refute @user.reload.avatar.attached?
  end

  test 'avatar update rejects non-square and oversized images' do
    login_as(@user)

    patch avatar_api_account_url, params: { avatar: non_square_avatar }
    assert_response :unprocessable_entity
    assert_includes response_json, 'Avatar must be a square image'

    patch avatar_api_account_url, params: { avatar: oversized_avatar }
    assert_response :unprocessable_entity
    assert_equal ['Avatar must be 5 MB or smaller'], response_json
    refute @user.reload.avatar.attached?
  end

  test 'avatar replacement purges the previous blob and stored object without a job' do
    @user.avatar.attach(square_avatar)
    previous_blob = @user.avatar.blob
    previous_key = previous_blob.key
    assert ActiveStorage::Blob.service.exist?(previous_key)

    login_as(@user)

    assert_no_enqueued_jobs only: ActiveStorage::PurgeJob do
      patch avatar_api_account_url, params: { avatar: square_avatar }
    end

    assert_response :success
    refute ActiveStorage::Blob.exists?(previous_blob.id)
    refute ActiveStorage::Blob.service.exist?(previous_key)
    assert @user.reload.avatar.attached?
    refute_equal previous_blob.id, @user.avatar.blob.id
  end

  test 'failed avatar validation preserves the previous blob and stored object' do
    @user.avatar.attach(square_avatar)
    previous_blob = @user.avatar.blob
    previous_key = previous_blob.key

    login_as(@user)
    patch avatar_api_account_url, params: { avatar: non_square_avatar }

    assert_response :unprocessable_entity
    assert ActiveStorage::Blob.exists?(previous_blob.id)
    assert ActiveStorage::Blob.service.exist?(previous_key)
    assert_equal previous_blob.id, @user.reload.avatar.blob.id
  end

  test 'shared guest account cannot change its password or avatar' do
    guest = create_user(User::SHARED_GUEST_USERNAME)
    login_as(guest)

    patch password_api_account_url, params: password_params
    assert_response :unprocessable_entity
    assert_equal ['Account settings are unavailable for the shared guest account'], response_json

    patch avatar_api_account_url, params: { avatar: square_avatar }
    assert_response :unprocessable_entity
    assert_equal ['Account settings are unavailable for the shared guest account'], response_json
    assert guest.reload.is_password?('password')
    refute guest.avatar.attached?
  end

  private

  def create_user(username)
    User.create!(username: username, password: 'password')
  end

  def login_as(user)
    post api_session_url, params: {
      user: { username: user.username, password: 'password' }
    }
  end

  def password_params(overrides = {})
    {
      account: {
        current_password: 'password',
        password: 'new-password',
        password_confirmation: 'new-password'
      }.merge(overrides)
    }
  end

  def square_avatar
    uploaded_file(Rails.root.join('app/assets/images/profile_blue_150x150.png'), 'image/png')
  end

  def non_square_avatar
    uploaded_file(Rails.root.join('app/assets/images/mac_table.png'), 'image/png')
  end

  def svg_avatar
    uploaded_file(Rails.root.join('test/fixtures/files/test-image.svg'), 'image/png')
  end

  def unreadable_avatar
    tempfile = Tempfile.new(['unreadable-avatar', '.png'])
    tempfile.binmode
    tempfile.write('not an image')
    tempfile.rewind
    @tempfiles << tempfile
    uploaded_file(tempfile.path, 'image/png')
  end

  def oversized_avatar
    tempfile = Tempfile.new(['oversized-avatar', '.png'])
    tempfile.binmode
    tempfile.write('x' * (AvatarUpdater::MAXIMUM_FILE_SIZE + 1))
    tempfile.rewind
    @tempfiles << tempfile
    uploaded_file(tempfile.path, 'image/png')
  end

  def uploaded_file(path, content_type)
    Rack::Test::UploadedFile.new(path, content_type)
  end

  def response_json
    JSON.parse(response.body)
  end
end
