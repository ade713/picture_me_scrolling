class PasswordResetMailer < ApplicationMailer
  SUBJECT = 'Reset your PicMeS password'.freeze

  def reset
    user = params.fetch(:user)
    @reset_url = reset_url(params.fetch(:raw_token))

    mail(to: user.email, subject: SUBJECT)
  end

  private

  def reset_url(raw_token)
    "#{root_url}#/reset-password/#{ERB::Util.url_encode(raw_token)}"
  end
end
