class PasswordResetMailerPreview < ActionMailer::Preview
  def reset
    user = User.new(
      username: 'Preview User',
      email: 'preview@example.com'
    )

    PasswordResetMailer.with(
      user: user,
      raw_token: 'preview-password-reset-token'
    ).reset
  end
end
