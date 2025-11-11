# Source - https://stackoverflow.com/a/79359586
# momentarily patching Paperclip to add attachment method to migrations

module Paperclip
  module Validators
    class AttachmentContentTypeValidator < ActiveModel::EachValidator
      def mark_invalid(record, attribute, types)
        record.errors.add attribute, :invalid, **options.merge(types: types.join(', '))
      end

      def validates_attachment_content_type(*attr_names)
        options = _merge_attributes(attr_names)
        validates_with AttachmentContentTypeValidator, **options.dup
        validate_before_processing AttachmentContentTypeValidator, **options.dup
      end
    end
  end
end
