# == Schema Information
#
# Table name: post_tags
#
#  id         :bigint           not null, primary key
#  post_id    :integer          not null
#  tag_id     :bigint           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class PostTag < ApplicationRecord
  DUPLICATE_TAG_MESSAGE = 'has already been added to this post'.freeze

  belongs_to :post
  belongs_to :tag

  validates :tag_id,
            uniqueness: {
              scope: :post_id,
              message: DUPLICATE_TAG_MESSAGE
            }
end
