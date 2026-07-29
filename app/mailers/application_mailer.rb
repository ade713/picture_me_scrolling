class ApplicationMailer < ActionMailer::Base
  default from: -> { Rails.configuration.x.mailer_from_address }
  layout 'mailer'
end
