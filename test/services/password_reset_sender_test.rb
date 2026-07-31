require 'test_helper'
require 'minitest/mock'

class PasswordResetSenderTest < ActiveSupport::TestCase
  setup do
    PasswordResetToken.delete_all
    User.delete_all
    ActionMailer::Base.deliveries.clear

    @user = User.create!(
      username: 'reset_sender_user',
      email: 'reset-sender@example.com',
      password: 'password'
    )
    @user.update!(email_verified_at: Time.current)
  end

  test 'issues a token and delivers the password reset email' do
    assert_difference('PasswordResetToken.count', 1) do
      assert_difference('ActionMailer::Base.deliveries.size', 1) do
        result = PasswordResetSender.new(user: @user).call

        assert result.success?
      end
    end

    assert_equal ['reset-sender@example.com'], ActionMailer::Base.deliveries.last.to
  end

  test 'reports and safely logs a synchronous delivery failure' do
    failing_delivery = Object.new
    failing_delivery.define_singleton_method(:reset) { self }
    failing_delivery.define_singleton_method(:deliver_now) do
      raise IOError, 'provider response containing sensitive data'
    end
    logged_messages = []

    result = Rails.logger.stub(:error, -> message { logged_messages << message }) do
      PasswordResetMailer.stub(:with, failing_delivery) do
        PasswordResetSender.new(user: @user).call
      end
    end

    refute result.success?
    assert_equal PasswordResetSender::DELIVERY_ERROR, result.error
    assert_equal 1, PasswordResetToken.count
    assert_equal 1, logged_messages.length
    assert_includes logged_messages.first, "user_id=#{@user.id}"
    assert_includes logged_messages.first, 'error=IOError'
    refute_includes logged_messages.first, @user.email
    refute_includes logged_messages.first, 'provider response'
  end
end
