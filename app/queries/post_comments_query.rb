class PostCommentsQuery
  include QueryPagination

  INVALID_CURSOR_ERROR = 'Comment cursor is invalid'.freeze
  CURSOR_PURPOSE = 'post_comments_newest_first'.freeze
  class InvalidCursorError < StandardError; end

  def self.call(post:, after: nil, per_page: nil)
    new(post: post, after: after, per_page: per_page).call
  end

  def initialize(post:, after: nil, per_page: nil)
    @post = post
    @after = after
    @per_page = per_page
  end

  def call
    comments = comments_after_cursor.order(created_at: :desc, id: :desc)
                      .includes(user: { avatar_attachment: :blob })
                      .limit(normalized_per_page + 1).to_a
    has_more = comments.length > normalized_per_page
    comments.pop if has_more
    pagination = {
      per_page: normalized_per_page,
      has_more: has_more,
      next_cursor: has_more ? cursor_for(comments.last) : nil
    }
    reply_counts = Comment.where(parent_id: comments.map(&:id)).group(:parent_id).count

    [comments, pagination, reply_counts]
  end

  private

  attr_reader :post, :after, :per_page

  def comments_after_cursor
    records = post.comments.where(parent_id: nil)
    return records unless after.present?

    raise InvalidCursorError, INVALID_CURSOR_ERROR unless after.is_a?(String)

    cursor = verifier.verified(after, purpose: CURSOR_PURPOSE)
    raise InvalidCursorError, INVALID_CURSOR_ERROR unless cursor && cursor['post_id'] == post.id

    records.where('(created_at, id) < (?, ?)', cursor['created_at'], cursor['id'])
  end

  def verifier
    Rails.application.message_verifier(CURSOR_PURPOSE)
  end

  def cursor_for(comment)
    verifier.generate(
      { 'post_id' => post.id, 'created_at' => comment.created_at.iso8601(6), 'id' => comment.id },
      purpose: CURSOR_PURPOSE
    )
  end
end
