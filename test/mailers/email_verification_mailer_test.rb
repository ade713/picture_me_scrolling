require 'test_helper'

class EmailVerificationMailerTest < ActionMailer::TestCase
  setup do
    @user = User.new(
      username: 'Mailer User',
      email: 'mailer@example.com'
    )
    @raw_token = 'raw-verification-token'
    @mail = EmailVerificationMailer.with(
      user: @user,
      raw_token: @raw_token
    ).verification
  end

  test 'addresses the verification message to the user' do
    assert_equal ['mailer@example.com'], @mail.to
    assert_equal ['accounts@picmes.test'], @mail.from
    assert_equal EmailVerificationMailer::SUBJECT, @mail.subject
  end

  test 'includes matching verification details in both formats' do
    expected_url = 'https://example.test/#/verify-email/raw-verification-token'
    html_body = @mail.html_part.body.to_s
    text_body = @mail.text_part.body.to_s

    assert_includes html_body, expected_url
    assert_includes text_body, expected_url
    assert_includes html_body, 'This link expires in 24 hours'
    assert_includes text_body, 'This link expires in 24 hours'
    assert_includes html_body, 'can only be used once'
    assert_includes text_body, 'can only be used once'
    assert_includes html_body, 'you can ignore this email'
    assert_includes text_body, 'you can ignore this email'
  end

  test 'encodes the raw token in the verification URL' do
    mail = EmailVerificationMailer.with(
      user: @user,
      raw_token: 'token with/slash'
    ).verification

    assert_includes mail.text_part.body.to_s, 'token%20with%2Fslash'
  end

  test 'preview renders the verification email' do
    preview = EmailVerificationMailerPreview.new

    assert_equal ['preview@example.com'], preview.verification.to
  end
end
