require_relative 'boot'

require 'rails/all'
require 'aws-sdk-s3'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Fsp
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.x.mailer_from_address = ENV.fetch(
      "MAILER_FROM_ADDRESS",
      "PicMeS Accounts <accounts@picmes.test>"
    )
  end
end
