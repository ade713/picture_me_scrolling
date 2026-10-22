class CommentRepliesQuery
  include QueryPagination

  DEFAULT_REPLIES_PER_PAGE = 3
  CURSOR_PURPOSE = 'comment_replies_older'.freeze
  INVALID_CURSOR_ERROR = 'Reply cursor is invalid'.freeze
  class InvalidCursorError < StandardError; end

  def self.call(parent:, before: nil, per_page: nil)
    new(parent: parent, before: before, per_page: per_page).call
  end

  def initialize(parent:, before: nil, per_page: nil)
    @parent = parent
    @before = before
    @per_page = per_page
  end

  def call
    replies = replies_before_cursor.order(created_at: :desc, id: :desc)
                                  .includes(user: { avatar_attachment: :blob })
                                  .limit(normalized_per_page + 1).to_a
    has_more = replies.length > normalized_per_page
    replies.pop if has_more
    pagination = {
      per_page: normalized_per_page,
      has_more: has_more,
      next_cursor: has_more ? cursor_for(replies.last) : nil
    }

    # Select the newest batch, but render each batch chronologically.
    [replies.reverse, pagination]
  end

  private

  attr_reader :parent, :before, :per_page

  def normalized_per_page
    integer_param(per_page, DEFAULT_REPLIES_PER_PAGE).clamp(MIN_PER_PAGE, MAX_PER_PAGE)
  end

  def replies_before_cursor
    records = parent.replies
    return records unless before.present?

    raise InvalidCursorError, INVALID_CURSOR_ERROR unless before.is_a?(String)

    cursor = verifier.verified(before, purpose: CURSOR_PURPOSE)
    raise InvalidCursorError, INVALID_CURSOR_ERROR unless cursor && cursor['parent_id'] == parent.id

    records.where('(created_at, id) < (?, ?)', cursor['created_at'], cursor['id'])
  end

  def verifier
    Rails.application.message_verifier(CURSOR_PURPOSE)
  end

  def cursor_for(reply)
    verifier.generate(
      { 'parent_id' => parent.id, 'created_at' => reply.created_at.iso8601(6), 'id' => reply.id },
      purpose: CURSOR_PURPOSE
    )
  end
end
