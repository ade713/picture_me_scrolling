class EmailVerificationTokenIssuer
  TOKEN_BYTES = 32
  LIFETIME = 24.hours

  Result = Struct.new(:raw_token, :verification_token, keyword_init: true)

  def initialize(user:, current_time: Time.current)
    @user = user
    @current_time = current_time
  end

  def call
    raw_token = SecureRandom.urlsafe_base64(TOKEN_BYTES)
    verification_token = nil

    user.with_lock do
      verification_token = EmailVerificationToken.find_or_initialize_by(
        user_id: user.id
      )
      verification_token.update!(
        token_digest: EmailVerificationToken.digest(raw_token),
        expires_at: current_time + LIFETIME
      )
    end

    Result.new(raw_token: raw_token, verification_token: verification_token)
  end

  private

  attr_reader :current_time, :user
end
