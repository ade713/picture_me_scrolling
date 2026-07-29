# == Schema Information
#
# Table name: email_verification_tokens
#
#  id           :bigint           not null, primary key
#  user_id      :integer          not null
#  token_digest :string           not null
#  expires_at   :datetime         not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class EmailVerificationToken < ApplicationRecord
  belongs_to :user

  validates :token_digest, :expires_at, presence: true
  validates :token_digest, uniqueness: true
  validates :user_id,
            uniqueness: {
              message: 'already has a verification token'
            }
  validate :user_is_eligible

  def self.digest(raw_token)
    Digest::SHA256.hexdigest(raw_token)
  end

  def expired?(at: Time.current)
    expires_at <= at
  end

  private

  def user_is_eligible
    return unless user

    errors.add(:user, 'must have an email address') if user.email.blank?
    return if user.account_settings_enabled?

    errors.add(:user, 'cannot be the shared guest account')
  end
end
