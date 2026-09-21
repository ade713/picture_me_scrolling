class Comment < ApplicationRecord
  belongs_to :post, inverse_of: :comments
  belongs_to :user, optional: true, inverse_of: :comments
  belongs_to :parent, class_name: 'Comment', optional: true, inverse_of: :replies

  has_many :replies, class_name: 'Comment', foreign_key: :parent_id,
                     inverse_of: :parent
end
