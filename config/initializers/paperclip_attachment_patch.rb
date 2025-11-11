# Source - https://stackoverflow.com/a/79359586
# momentarily patching Paperclip to add attachment method to migrations

module Paperclip
  module Schema
    module TableDefinition
      def attachment(*attachment_names)
        options = attachment_names.extract_options!

        attachment_names.each do |attachment_name|
          COLUMNS.each_pair do |column_name, column_type|
            column_options = options.merge(options[column_name.to_sym] || {})
            column("#{attachment_name}_#{column_name}", column_type, **column_options)
          end
        end
      end
    end
  end
end
