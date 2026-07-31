# == Schema Information
#
# Table name: users
#
#  id                  :integer          not null, primary key
#  username            :string           not null
#  email               :string
#  email_verified_at   :datetime
#  password_digest     :string           not null
#  session_token       :string           not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class User < ApplicationRecord
  DEFAULT_AVATAR_IMAGE = 'profile_blue_150x150.png'.freeze
  DEFAULT_RECOMMENDED_FOLLOW_LIMIT = 6
  MAXIMUM_EMAIL_LENGTH = 254
  MINIMUM_PASSWORD_LENGTH = 6
  MAXIMUM_PASSWORD_LENGTH = 64
  MAXIMUM_PASSWORD_BYTES = 72
  SHARED_GUEST_USERNAME = 'PicMeS Guest'.freeze

  normalizes :email, with: -> email { email.strip.downcase.presence }

  validates :username,
            :password_digest,
            :session_token,
            presence: true, uniqueness: true
  validates :email,
            format: { with: URI::MailTo::EMAIL_REGEXP },
            length: { maximum: MAXIMUM_EMAIL_LENGTH },
            uniqueness: { case_sensitive: false },
            allow_blank: true
  validates :email, presence: true, on: [:signup, :email_update]
  validates :password,
            length: {
              minimum: MINIMUM_PASSWORD_LENGTH,
              maximum: MAXIMUM_PASSWORD_LENGTH,
              allow_nil: true
            }
  validate :password_within_bcrypt_limit

  before_validation :clear_email_verification, if: :will_save_change_to_email?
  after_update :invalidate_email_identity_tokens, if: :saved_change_to_email?
  after_initialize :ensure_session_token!
  before_destroy :remember_avatar_blob_for_purge
  after_destroy_commit :purge_destroyed_avatar

  has_many :posts,
    primary_key: :id,
    foreign_key: :author_id,
    class_name: "Post"

  has_many :likes,
    primary_key: :id,
    foreign_key: :user_id,
    class_name: "Like"

  has_many :followers,
    primary_key: :id,
    foreign_key: :followee_id,
    class_name: "Follow"

  has_many :followees,
    primary_key: :id,
    foreign_key: :follower_id,
    class_name: "Follow"

  has_many :followee_users,
    through: :followees,
    source: :followee

  has_many :followed_posts,
    through: :followee_users,
    source: :posts

  has_one :email_verification_token, dependent: :destroy
  has_one :password_reset_token, dependent: :destroy

  def recommended_follow_users(limit: DEFAULT_RECOMMENDED_FOLLOW_LIMIT)
    recommended_users = recommended_follow_user_scope.limit(limit)

    return recommended_users if recommended_users.exists?

    recommended_follow_user_scope
      .order(Arel.sql("RANDOM()"))
      .limit(limit)
  end

  has_one_attached :avatar, dependent: :destroy

  attr_reader :password

  def password=(password)
    @password = password
    self.password_digest = BCrypt::Password.create(password)
  end

  def is_password?(password)
    BCrypt::Password.new(self.password_digest).is_password?(password)
  end

  def account_settings_enabled?
    username != SHARED_GUEST_USERNAME
  end

  def ensure_session_token!
    self.session_token ||= SecureRandom::urlsafe_base64
  end

  def reset_session_token!
    self.session_token = SecureRandom::urlsafe_base64
    self.save!
    self.session_token
  end

  def self.find_by_credentials(username, password)
    user = User.find_by(username: username)
    user && user.is_password?(password) ? user : nil
  end

  private

  def clear_email_verification
    self.email_verified_at = nil
  end

  def invalidate_email_identity_tokens
    EmailVerificationToken.find_by(user_id: id)&.destroy!
    PasswordResetToken.find_by(user_id: id)&.destroy!
  end

  def remember_avatar_blob_for_purge
    @avatar_blob_for_purge = avatar.blob if avatar.attached?
  end

  def purge_destroyed_avatar
    @avatar_blob_for_purge&.purge
  rescue StandardError => error
    Rails.logger.error(
      "Destroyed user avatar purge failed user_id=#{id} " \
      "blob_id=#{@avatar_blob_for_purge&.id} " \
      "key=#{@avatar_blob_for_purge&.key} error=#{error.class}"
    )
  end

  def password_within_bcrypt_limit
    return unless password && password.bytesize > MAXIMUM_PASSWORD_BYTES

    errors.add(:password, "is too long (maximum is #{MAXIMUM_PASSWORD_BYTES} bytes)")
  end

  def recommended_follow_user_scope
    User
      .where.not(id: followee_users.select(:id))
      .where.not(id: id)
  end
end
