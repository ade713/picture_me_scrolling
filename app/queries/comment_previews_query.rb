class CommentPreviewsQuery
  PREVIEW_LIMIT = 3

  def self.call(post_ids:)
    return {} if post_ids.empty?

    # Rank within each post before limiting: a global LIMIT would starve other
    # posts, while trimming in Ruby would load their entire discussions.
    ranked_comments = Comment.where(post_id: post_ids, parent_id: nil, deleted_at: nil)
                             .select(<<~SQL.squish)
                               comments.*, ROW_NUMBER() OVER (
                                 PARTITION BY post_id ORDER BY created_at DESC, id DESC
                               ) AS preview_rank
                             SQL

    Comment.from(ranked_comments, :comments)
           .where('preview_rank <= ?', PREVIEW_LIMIT)
           .order(:post_id, :created_at, :id)
           .includes(user: { avatar_attachment: :blob })
           .group_by(&:post_id)
  end
end
