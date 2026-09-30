class Comment < ApplicationRecord
  MAXIMUM_BODY_LENGTH = 1_000
  PARENT_REQUIRED_ERROR = 'must exist'.freeze
  PARENT_POST_ERROR = 'must belong to the same post'.freeze
  PARENT_DEPTH_ERROR = 'must be a top-level comment'.freeze
  PARENT_DELETED_ERROR = 'cannot be deleted'.freeze
  PARENT_SELF_ERROR = 'cannot be the comment itself'.freeze

  belongs_to :post, inverse_of: :comments
  belongs_to :user, optional: true, inverse_of: :comments
  belongs_to :parent, class_name: 'Comment', optional: true, inverse_of: :replies

  has_many :replies, class_name: 'Comment', foreign_key: :parent_id,
                     inverse_of: :parent

  validates :user, presence: true, unless: :deleted?
  validates :body, presence: true, length: { maximum: MAXIMUM_BODY_LENGTH },
                   unless: :deleted?
  validate :valid_reply_parent

  def deleted?
    deleted_at.present?
  end

  private

  def valid_reply_parent
    if parent.nil?
      errors.add(:parent, PARENT_REQUIRED_ERROR) if parent_id.present?
      return
    end

    errors.add(:parent, PARENT_SELF_ERROR) if parent == self
    errors.add(:parent, PARENT_POST_ERROR) unless parent.post == post
    errors.add(:parent, PARENT_DEPTH_ERROR) if parent.parent.present? || parent.parent_id.present?

    if parent.deleted? && (new_record? || will_save_change_to_parent_id?)
      errors.add(:parent, PARENT_DELETED_ERROR)
    end
  end
end
