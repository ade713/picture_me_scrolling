require 'test_helper'
require 'minitest/mock'

class AvatarUpdaterTest < ActiveSupport::TestCase
  setup do
    User.delete_all
    ActiveStorage::Attachment.delete_all
    ActiveStorage::Blob.delete_all

    @user = User.create!(username: 'avatar_service_user', password: 'password')
    @user.avatar.attach(square_avatar)
  end

  test 'cleanup failure keeps the successful replacement and logs the stale blob' do
    previous_blob = @user.avatar.blob
    log_messages = []

    previous_blob.stub(:purge, -> { raise ActiveStorage::FileNotFoundError }) do
      Rails.logger.stub(:error, ->(message) { log_messages << message }) do
        result = AvatarUpdater.new(user: @user, upload: square_avatar).call

        assert result.success?
      end
    end

    assert @user.reload.avatar.attached?
    refute_equal previous_blob.id, @user.avatar.blob.id
    assert ActiveStorage::Blob.exists?(previous_blob.id)
    assert_equal 1, log_messages.length
    assert_includes log_messages.first, "user_id=#{@user.id}"
    assert_includes log_messages.first, "blob_id=#{previous_blob.id}"
    assert_includes log_messages.first, 'error=ActiveStorage::FileNotFoundError'
  end

  test 'storage failure preserves the current avatar and removes the candidate blob' do
    previous_blob = @user.avatar.blob
    previous_key = previous_blob.key
    initial_blob_count = ActiveStorage::Blob.count

    ActiveStorage::Blob.service.stub(
      :upload,
      ->(*, **) { raise ActiveStorage::IntegrityError }
    ) do
      result = AvatarUpdater.new(user: @user, upload: square_avatar).call

      refute result.success?
    end

    assert_equal previous_blob.id, @user.reload.avatar.blob.id
    assert ActiveStorage::Blob.service.exist?(previous_key)
    assert_equal initial_blob_count, ActiveStorage::Blob.count
  end

  private

  def square_avatar
    Rack::Test::UploadedFile.new(
      Rails.root.join('app/assets/images/profile_blue_150x150.png'),
      'image/png'
    )
  end
end
