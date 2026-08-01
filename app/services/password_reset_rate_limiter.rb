class PasswordResetRateLimiter
  EMAIL_LIMIT = 3
  IP_LIMIT = 10
  WINDOW = 1.hour
  CACHE_NAMESPACE = 'password_reset_rate_limit'.freeze

  def initialize(email:, ip:, cache: Rails.cache, current_time: Time.current)
    @email = email
    @ip = ip
    @cache = cache
    @current_time = current_time
  end

  def allowed?
    email_count = increment(:email, normalized_email)
    ip_count = increment(:ip, ip.to_s)

    email_count <= EMAIL_LIMIT && ip_count <= IP_LIMIT
  end

  private

  attr_reader :cache, :current_time, :email, :ip

  def increment(scope, value)
    cache.increment(cache_key(scope, value), 1, expires_in: WINDOW) || 1
  end

  def cache_key(scope, value)
    digest = Digest::SHA256.hexdigest(value)
    "#{CACHE_NAMESPACE}:#{scope}:#{window_number}:#{digest}"
  end

  def normalized_email
    User.normalize_value_for(:email, email).to_s
  end

  def window_number
    current_time.to_i / WINDOW.to_i
  end
end
