class EmailVerificationMailerPreview < ActionMailer::Preview
  def verification
    user = User.new(
      username: 'Preview User',
      email: 'preview@example.com'
    )

    EmailVerificationMailer.with(
      user: user,
      raw_token: 'preview-verification-token'
    ).verification
  end
end
