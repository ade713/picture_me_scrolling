class PasswordResetTokenConsumer
  INVALID_TOKEN_ERROR = :invalid_token
  EXPIRED_TOKEN_ERROR = :expired_token
  VALIDATION_ERROR = :validation
  CONFIRMATION_ERROR = "Password confirmation doesn't match password".freeze

  Result = Struct.new(:user, :error, :errors, keyword_init: true) do
    def success?
      error.nil?
    end
  end

  def initialize(
    token: nil,
    password: nil,
    password_confirmation: nil,
    current_time: Time.current
  )
    @raw_token = token
    @password = password.to_s
    @password_confirmation = password_confirmation.to_s
    @current_time = current_time
  end

  def call
    candidate = PasswordResetToken.find_by(token_digest: token_digest)
    return failure(INVALID_TOKEN_ERROR) unless candidate

    consume(candidate)
  end

  private

  attr_reader :current_time, :password, :password_confirmation, :raw_token

  def consume(candidate)
    result = nil

    User.transaction do
      user = User.lock.find_by(id: candidate.user_id)
      reset_token = locked_token(candidate, user)

      result = consume_locked_token(user, reset_token)
    end

    result
  end

  def locked_token(candidate, user)
    return unless user

    PasswordResetToken.lock.find_by(
      id: candidate.id,
      user_id: user.id,
      token_digest: token_digest
    )
  end

  def consume_locked_token(user, reset_token)
    return failure(INVALID_TOKEN_ERROR) unless reset_token

    if reset_token.expired?(at: current_time)
      reset_token.destroy!
      return failure(EXPIRED_TOKEN_ERROR)
    end

    return validation_failure([CONFIRMATION_ERROR]) unless passwords_match?

    user.password = password
    return validation_failure(user.errors.full_messages) unless user.valid?

    user.reset_session_token!
    reset_token.destroy!
    Result.new(user: user)
  end

  def failure(error)
    Result.new(error: error)
  end

  def validation_failure(errors)
    Result.new(error: VALIDATION_ERROR, errors: errors)
  end

  def passwords_match?
    password == password_confirmation
  end

  def token_digest
    @token_digest ||= PasswordResetToken.digest(raw_token.to_s)
  end
end
