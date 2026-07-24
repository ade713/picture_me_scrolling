class AvatarUpdater
  MAXIMUM_FILE_SIZE_MEGABYTES = 5
  FORMAT_LABEL = 'JPEG, PNG, WebP, or GIF'.freeze
  ALLOWED_TYPES = %i[gif jpeg png webp].freeze
  CONTENT_TYPES = {
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  }.freeze
  MAXIMUM_FILE_SIZE = MAXIMUM_FILE_SIZE_MEGABYTES.megabytes

  Result = Struct.new(:user, :errors, keyword_init: true) do
    def success?
      errors.empty?
    end
  end

  def initialize(user:, upload:)
    @user = user
    @upload = upload
  end

  def call
    validation_errors = validate_upload
    return Result.new(user: user, errors: validation_errors) if validation_errors.any?

    previous_blob = user.avatar.blob if user.avatar.attached?
    replacement_blob = create_and_upload_blob
    user.avatar.attach(replacement_blob)

    unless user.avatar.attached? && user.avatar.blob.persisted?
      replacement_blob.purge
      return Result.new(user: user, errors: ['Avatar could not be updated'])
    end

    purge_previous_blob(previous_blob)
    Result.new(user: user, errors: [])
  rescue ActiveStorage::Error, ActiveRecord::RecordInvalid => error
    purge_unattached_replacement(replacement_blob)
    Result.new(user: user, errors: [error.message])
  end

  private

  attr_reader :user, :upload

  def validate_upload
    return ['Avatar is required'] unless upload
    if upload.size > MAXIMUM_FILE_SIZE
      return ["Avatar must be #{MAXIMUM_FILE_SIZE_MEGABYTES} MB or smaller"]
    end

    @image_type, dimensions = image_metadata
    errors = []
    errors << "Avatar must be a #{FORMAT_LABEL} image" unless ALLOWED_TYPES.include?(@image_type)
    errors << 'Avatar must be a square image' unless dimensions && dimensions[0] == dimensions[1]
    errors
  rescue FastImage::FastImageException, IOError, SystemCallError
    ["Avatar must be a readable #{FORMAT_LABEL} image"]
  ensure
    upload.tempfile.rewind if upload&.respond_to?(:tempfile)
  end

  def image_metadata
    path = upload.tempfile.path
    [
      FastImage.type(path, raise_on_failure: true),
      FastImage.size(path, raise_on_failure: true)
    ]
  end

  def create_and_upload_blob
    upload.tempfile.rewind
    blob = ActiveStorage::Blob.build_after_unfurling(
      io: upload.tempfile,
      filename: upload.original_filename,
      content_type: CONTENT_TYPES.fetch(@image_type),
      identify: false
    )
    blob.save!
    upload.tempfile.rewind
    blob.upload_without_unfurling(upload.tempfile)
    blob
  rescue StandardError => error
    purge_unattached_replacement(blob)
    raise error
  ensure
    upload.tempfile.rewind
  end

  def purge_previous_blob(blob)
    return unless blob
    return if blob.id == user.avatar.blob.id

    blob.purge
  rescue StandardError => error
    Rails.logger.error(
      "Old avatar purge failed user_id=#{user.id} blob_id=#{blob.id} " \
      "key=#{blob.key} error=#{error.class}"
    )
  end

  def purge_unattached_replacement(blob)
    return unless blob&.persisted?
    return if blob.attachments.exists?

    blob.purge
  rescue StandardError => error
    Rails.logger.error(
      "Failed avatar candidate purge user_id=#{user.id} blob_id=#{blob&.id} " \
      "key=#{blob&.key} error=#{error.class}"
    )
  end
end
