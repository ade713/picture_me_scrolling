# == Schema Information
#
# Table name: tags
#
#  id         :bigint           not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Tag < ApplicationRecord
  MAXIMUM_NAME_LENGTH = 30
  NAME_FORMAT = /\A[a-z0-9]+(?:_[a-z0-9]+)*\z/.freeze

  normalizes :name, with: -> name { name.strip.downcase }

  validates :name,
            presence: true,
            length: { maximum: MAXIMUM_NAME_LENGTH },
            format: { with: NAME_FORMAT, allow_blank: true },
            uniqueness: true
end
