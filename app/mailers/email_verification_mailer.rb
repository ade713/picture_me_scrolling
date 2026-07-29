class EmailVerificationMailer < ApplicationMailer
  SUBJECT = 'Verify your PicMeS email address'.freeze

  def verification
    user = params.fetch(:user)
    @verification_url = verification_url(params.fetch(:raw_token))

    mail(to: user.email, subject: SUBJECT)
  end

  private

  def verification_url(raw_token)
    "#{root_url}#/verify-email/#{ERB::Util.url_encode(raw_token)}"
  end
end
