require 'test_helper'

class PasswordResetMailerTest < ActionMailer::TestCase
  setup do
    @user = User.new(
      username: 'Reset Mailer User',
      email: 'reset-mailer@example.com'
    )
    @raw_token = 'raw-password-reset-token'
    @mail = PasswordResetMailer.with(
      user: @user,
      raw_token: @raw_token
    ).reset
  end

  test 'addresses the password reset message to the user' do
    assert_equal ['reset-mailer@example.com'], @mail.to
    assert_equal ['accounts@picmes.test'], @mail.from
    assert_equal PasswordResetMailer::SUBJECT, @mail.subject
  end

  test 'includes matching reset details in both formats' do
    expected_url = 'https://example.test/#/reset-password/raw-password-reset-token'
    html_body = @mail.html_part.body.to_s
    text_body = @mail.text_part.body.to_s

    assert_includes html_body, expected_url
    assert_includes text_body, expected_url
    assert_includes html_body, 'This link expires in 30 minutes'
    assert_includes text_body, 'This link expires in 30 minutes'
    assert_includes html_body, 'can only be used once'
    assert_includes text_body, 'can only be used once'
    assert_includes html_body, 'password has not been changed'
    assert_includes text_body, 'password has not been changed'
  end

  test 'encodes the raw token in the reset URL' do
    mail = PasswordResetMailer.with(
      user: @user,
      raw_token: 'token with/slash'
    ).reset

    assert_includes mail.text_part.body.to_s, 'token%20with%2Fslash'
  end

  test 'preview renders the password reset email' do
    preview = PasswordResetMailerPreview.new

    assert_equal ['preview@example.com'], preview.reset.to
  end
end
