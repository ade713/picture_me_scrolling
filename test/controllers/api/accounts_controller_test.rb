require 'test_helper'
require 'minitest/mock'

class Api::AccountsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    Like.delete_all
    Follow.delete_all
    Post.delete_all
    EmailVerificationToken.delete_all
    User.delete_all
    ActiveStorage::Attachment.delete_all
    ActiveStorage::Blob.delete_all
    ActionMailer::Base.deliveries.clear

    @user = create_user('account_user')
    @tempfiles = []
  end

  teardown do
    @tempfiles.each(&:close!)
  end

  test 'account endpoints require login' do
    patch avatar_api_account_url, params: { avatar: valid_avatar }
    assert_response :unauthorized

    patch email_api_account_url, params: {
      account: { email: 'account@example.com' }
    }
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

  test 'password update enforces character and bcrypt byte limits' do
    login_as(@user)

    patch password_api_account_url, params: password_params(password: 'short', password_confirmation: 'short')
    assert_response :unprocessable_entity
    assert_includes response_json, 'Password is too short (minimum is 6 characters)'

    long_password = 'a' * (User::MAXIMUM_PASSWORD_LENGTH + 1)
    patch password_api_account_url,
          params: password_params(password: long_password, password_confirmation: long_password)

    assert_response :unprocessable_entity
    assert_includes response_json, 'Password is too long (maximum is 64 characters)'

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

  test 'email update normalizes the address, clears verification, and retains the session' do
    @user.update_columns(
      email: 'old@example.com',
      email_verified_at: Time.current
    )
    login_as(@user)
    session_token = @user.reload.session_token

    patch email_api_account_url, params: {
      account: { email: ' NEW@Example.COM ' }
    }

    assert_response :success
    assert_equal 'new@example.com', response_json['email']
    assert_nil response_json['email_verified_at']
    assert_equal 'new@example.com', @user.reload.email
    assert_nil @user.email_verified_at
    assert_equal session_token, @user.session_token
    assert_equal 1, EmailVerificationToken.count
    assert_equal ['new@example.com'], ActionMailer::Base.deliveries.last.to

    get api_users_url
    assert_response :success
  end

  test 'email update preserves verification when the normalized address is unchanged' do
    verified_at = Time.current.change(usec: 0)
    @user.update_columns(
      email: 'account@example.com',
      email_verified_at: verified_at
    )
    login_as(@user)

    patch email_api_account_url, params: {
      account: { email: ' ACCOUNT@EXAMPLE.COM ' }
    }

    assert_response :success
    assert_equal verified_at, @user.reload.email_verified_at
    assert_equal 0, EmailVerificationToken.count
    assert_empty ActionMailer::Base.deliveries
  end

  test 'email update succeeds when verification delivery fails' do
    failing_delivery = Object.new
    failing_delivery.define_singleton_method(:verification) { self }
    failing_delivery.define_singleton_method(:deliver_now) { raise IOError }
    login_as(@user)

    Rails.logger.stub(:error, -> _message {}) do
      EmailVerificationMailer.stub(:with, failing_delivery) do
        patch email_api_account_url, params: {
          account: { email: 'delivery-failure@example.com' }
        }
      end
    end

    assert_response :success
    assert_equal 'delivery-failure@example.com', @user.reload.email
    assert_equal 1, EmailVerificationToken.count
  end

  test 'email update rejects blank, invalid, and duplicate addresses' do
    other_user = create_user('other_email_user')
    other_user.update!(email: 'taken@example.com')
    verified_at = Time.current.change(usec: 0)
    @user.update_columns(
      email: 'current@example.com',
      email_verified_at: verified_at
    )
    login_as(@user)

    [
      ['', "Email can't be blank"],
      ['not-an-email', 'Email is invalid'],
      ['taken@example.com', 'Email has already been taken']
    ].each do |email, error|
      patch email_api_account_url, params: { account: { email: email } }

      assert_response :unprocessable_entity
      assert_includes response_json, error
      assert_equal 'current@example.com', @user.reload.email
      assert_equal verified_at, @user.email_verified_at
    end
  end

  test 'avatar update attaches a valid rectangular raster image' do
    login_as(@user)
    patch avatar_api_account_url, params: { avatar: rectangular_avatar }

    assert_response :success
    assert @user.reload.avatar.attached?
    assert_equal 'mac_table.png', @user.avatar.filename.to_s
    assert_includes response_json['avatar_url'], 'mac_table.png'
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

  test 'avatar update rejects oversized images' do
    login_as(@user)

    patch avatar_api_account_url, params: { avatar: oversized_avatar }
    assert_response :unprocessable_entity
    assert_equal ['Avatar must be 5 MB or smaller'], response_json
    refute @user.reload.avatar.attached?
  end

  test 'avatar replacement purges the previous blob and stored object without a job' do
    @user.avatar.attach(valid_avatar)
    previous_blob = @user.avatar.blob
    previous_key = previous_blob.key
    assert ActiveStorage::Blob.service.exist?(previous_key)

    login_as(@user)

    assert_no_enqueued_jobs only: ActiveStorage::PurgeJob do
      patch avatar_api_account_url, params: { avatar: valid_avatar }
    end

    assert_response :success
    refute ActiveStorage::Blob.exists?(previous_blob.id)
    refute ActiveStorage::Blob.service.exist?(previous_key)
    assert @user.reload.avatar.attached?
    refute_equal previous_blob.id, @user.avatar.blob.id
  end

  test 'failed avatar validation preserves the previous blob and stored object' do
    @user.avatar.attach(valid_avatar)
    previous_blob = @user.avatar.blob
    previous_key = previous_blob.key

    login_as(@user)
    patch avatar_api_account_url, params: { avatar: svg_avatar }

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

    patch avatar_api_account_url, params: { avatar: valid_avatar }
    assert_response :unprocessable_entity
    assert_equal ['Account settings are unavailable for the shared guest account'], response_json

    patch email_api_account_url, params: {
      account: { email: 'guest@example.com' }
    }
    assert_response :unprocessable_entity
    assert_equal ['Account settings are unavailable for the shared guest account'], response_json

    assert guest.reload.is_password?('password')
    assert_nil guest.email
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

  def valid_avatar
    uploaded_file(Rails.root.join('app/assets/images/profile_blue_150x150.png'), 'image/png')
  end

  def rectangular_avatar
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
