class EmailVerificationSender
  DELIVERY_ERROR = :delivery_failed

  Result = Struct.new(:error, keyword_init: true) do
    def success?
      error.nil?
    end
  end

  def initialize(user:)
    @user = user
  end

  def call
    issued_token = EmailVerificationTokenIssuer.new(user: user).call

    deliver(issued_token.raw_token)
  end

  private

  attr_reader :user

  def deliver(raw_token)
    EmailVerificationMailer.with(
      user: user,
      raw_token: raw_token
    ).verification.deliver_now

    Result.new
  rescue StandardError => error
    Rails.logger.error(
      "Email verification delivery failed user_id=#{user.id} error=#{error.class}"
    )
    Result.new(error: DELIVERY_ERROR)
  end
end
