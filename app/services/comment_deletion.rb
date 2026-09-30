class CommentDeletion
  def initialize(comment:)
    @comment = comment
  end

  def call
    comment.post.with_lock do
      comment.reload

      if comment.replies.exists?
        comment.update!(body: nil, user: nil, deleted_at: comment.deleted_at || Time.current)
      else
        parent = comment.parent
        comment.destroy!
        parent.destroy! if parent&.deleted? && !parent.replies.exists?
      end
    end
  end

  private

  attr_reader :comment
end
