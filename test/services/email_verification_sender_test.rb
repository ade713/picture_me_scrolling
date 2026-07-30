require 'test_helper'
require 'minitest/mock'

class EmailVerificationSenderTest < ActiveSupport::TestCase
  setup do
    EmailVerificationToken.delete_all
    User.delete_all
    ActionMailer::Base.deliveries.clear

    @user = User.create!(
      username: 'verification_sender_user',
      email: 'sender@example.com',
      password: 'password'
    )
  end

  test 'issues a token and delivers the verification email' do
    assert_difference('EmailVerificationToken.count', 1) do
      assert_difference('ActionMailer::Base.deliveries.size', 1) do
        result = EmailVerificationSender.new(user: @user).call

        assert result.success?
      end
    end

    assert_equal ['sender@example.com'], ActionMailer::Base.deliveries.last.to
  end

  test 'reports and safely logs a synchronous delivery failure' do
    failing_delivery = Object.new
    failing_delivery.define_singleton_method(:verification) { self }
    failing_delivery.define_singleton_method(:deliver_now) do
      raise IOError, 'provider response containing sensitive data'
    end
    logged_messages = []

    result = Rails.logger.stub(:error, -> message { logged_messages << message }) do
      EmailVerificationMailer.stub(:with, failing_delivery) do
        EmailVerificationSender.new(user: @user).call
      end
    end

    refute result.success?
    assert_equal EmailVerificationSender::DELIVERY_ERROR, result.error
    assert_equal 1, EmailVerificationToken.count
    assert_equal 1, logged_messages.length
    assert_includes logged_messages.first, "user_id=#{@user.id}"
    assert_includes logged_messages.first, 'error=IOError'
    refute_includes logged_messages.first, @user.email
    refute_includes logged_messages.first, 'provider response'
  end
end
