# frozen_string_literal: true

namespace :migrate_paperclip do
  desc 'Compatibility wrapper for the old Paperclip data migration task name'
  task move_data: :environment do
    warn <<~MESSAGE.squish
      migrate_paperclip:move_data is a compatibility wrapper for older
      production runbooks or deployment notes. The canonical task is now
      migrate_paperclip:move_attachments.
    MESSAGE

    Rake::Task['migrate_paperclip:move_attachments'].invoke
  end
end
