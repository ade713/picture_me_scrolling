require 'test_helper'

class PasswordResetRateLimiterTest < ActiveSupport::TestCase
  setup do
    @cache = ActiveSupport::Cache::MemoryStore.new
    @current_time = Time.zone.parse('2026-08-01 12:15:00')
  end

  test 'allows three requests per normalized email within the window' do
    assert allowed?(email: ' User@Example.COM ', ip: '192.0.2.1')
    assert allowed?(email: 'user@example.com', ip: '192.0.2.2')
    assert allowed?(email: 'USER@EXAMPLE.COM', ip: '192.0.2.3')
    refute allowed?(email: 'user@example.com', ip: '192.0.2.4')

    assert allowed?(
      email: 'user@example.com',
      ip: '192.0.2.5',
      current_time: @current_time + 1.hour
    )
  end

  test 'allows ten requests per IP within the window' do
    10.times do |index|
      assert allowed?(
        email: "user-#{index}@example.com",
        ip: '192.0.2.1'
      )
    end

    refute allowed?(email: 'another@example.com', ip: '192.0.2.1')
  end

  test 'allows requests when the configured cache does not retain counters' do
    limiter = PasswordResetRateLimiter.new(
      email: 'user@example.com',
      ip: '192.0.2.1',
      cache: ActiveSupport::Cache::NullStore.new,
      current_time: @current_time
    )

    assert limiter.allowed?
  end

  test 'does not include the email address in cache keys' do
    keys = []
    recording_cache = Object.new
    recording_cache.define_singleton_method(:increment) do |key, *_args|
      keys << key
      1
    end

    PasswordResetRateLimiter.new(
      email: 'sensitive@example.com',
      ip: '192.0.2.1',
      cache: recording_cache,
      current_time: @current_time
    ).allowed?

    assert_equal 2, keys.length
    keys.each { |key| refute_includes key, 'sensitive@example.com' }
  end

  test 'uses new counter keys in the next fixed window' do
    keys = []
    recording_cache = Object.new
    recording_cache.define_singleton_method(:increment) do |key, *_args|
      keys << key
      1
    end

    [@current_time, @current_time + 1.hour].each do |time|
      PasswordResetRateLimiter.new(
        email: 'user@example.com',
        ip: '192.0.2.1',
        cache: recording_cache,
        current_time: time
      ).allowed?
    end

    assert_equal 4, keys.length
    refute_equal keys.first(2), keys.last(2)
  end

  private

  def allowed?(email:, ip:, current_time: @current_time)
    PasswordResetRateLimiter.new(
      email: email,
      ip: ip,
      cache: @cache,
      current_time: current_time
    ).allowed?
  end
end
