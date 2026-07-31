class PasswordResetTokenIssuer
  TOKEN_BYTES = 32
  LIFETIME = 30.minutes

  Result = Struct.new(:raw_token, :password_reset_token, keyword_init: true)

  def initialize(user:, current_time: Time.current)
    @user = user
    @current_time = current_time
  end

  def call
    prune_expired_tokens

    raw_token = SecureRandom.urlsafe_base64(TOKEN_BYTES)
    password_reset_token = nil

    user.with_lock do
      password_reset_token = PasswordResetToken.find_or_initialize_by(
        user_id: user.id
      )
      password_reset_token.update!(
        token_digest: PasswordResetToken.digest(raw_token),
        expires_at: current_time + LIFETIME
      )
    end

    Result.new(
      raw_token: raw_token,
      password_reset_token: password_reset_token
    )
  end

  private

  attr_reader :current_time, :user

  def prune_expired_tokens
    PasswordResetToken.where(expires_at: ..current_time).delete_all
  end
end
