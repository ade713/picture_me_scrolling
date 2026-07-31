# == Schema Information
#
# Table name: password_reset_tokens
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  token_digest :string           not null
#  expires_at   :datetime         not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class PasswordResetToken < ApplicationRecord
  DUPLICATE_USER_MESSAGE = 'already has a password reset token'.freeze
  SHARED_GUEST_MESSAGE = 'cannot be the shared guest account'.freeze
  UNVERIFIED_EMAIL_MESSAGE = 'must have a verified email address'.freeze

  belongs_to :user

  validates :token_digest, :expires_at, presence: true
  validates :token_digest, uniqueness: true
  validates :user_id,
            uniqueness: {
              message: DUPLICATE_USER_MESSAGE
            }
  validate :user_is_eligible

  def self.digest(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end

  def self.find_by_raw_token(raw_token)
    find_by(token_digest: digest(raw_token.to_s))
  end

  def expired?(at: Time.current)
    expires_at <= at
  end

  private

  def user_is_eligible
    return unless user

    errors.add(:user, UNVERIFIED_EMAIL_MESSAGE) unless user.email_verified_at?
    return if user.account_settings_enabled?

    errors.add(:user, SHARED_GUEST_MESSAGE)
  end
end
