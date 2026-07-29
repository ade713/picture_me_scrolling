class EmailVerificationTokenConsumer
  INVALID_TOKEN_ERROR = :invalid_token
  EXPIRED_TOKEN_ERROR = :expired_token

  Result = Struct.new(:user, :error, keyword_init: true) do
    def success?
      error.nil?
    end
  end

  def initialize(token:, current_time: Time.current)
    @raw_token = token
    @current_time = current_time
  end

  def call
    candidate = EmailVerificationToken.find_by(token_digest: token_digest)
    return failure(INVALID_TOKEN_ERROR) unless candidate

    consume(candidate)
  end

  private

  attr_reader :current_time, :raw_token

  def consume(candidate)
    result = nil

    User.transaction do
      user = User.lock.find_by(id: candidate.user_id)
      verification_token = locked_token(candidate, user)

      result = consume_locked_token(user, verification_token)
    end

    result
  end

  def locked_token(candidate, user)
    return unless user

    EmailVerificationToken.lock.find_by(
      id: candidate.id,
      user_id: user.id,
      token_digest: token_digest
    )
  end

  def consume_locked_token(user, verification_token)
    return failure(INVALID_TOKEN_ERROR) unless verification_token

    if verification_token.expired?(at: current_time)
      verification_token.destroy!
      return failure(EXPIRED_TOKEN_ERROR)
    end

    user.update!(email_verified_at: current_time)
    verification_token.destroy!
    Result.new(user: user)
  end

  def failure(error)
    Result.new(error: error)
  end

  def token_digest
    @token_digest ||= EmailVerificationToken.digest(raw_token.to_s)
  end
end
