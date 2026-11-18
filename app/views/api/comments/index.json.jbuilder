if @comments.empty?
  json.comments({})
else
  json.comments do
    @comments.each do |comment|
      json.set! comment.id do
        json.partial! 'api/comments/comment', comment: comment,
                      reply_count: @reply_counts.fetch(comment.id, 0)
      end
    end
  end
end
json.comment_ids @comments.map(&:id)
json.pagination @pagination
