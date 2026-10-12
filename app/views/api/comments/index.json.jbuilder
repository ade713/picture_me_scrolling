if @comments.empty?
  json.comments({})
else
  json.comments do
    @comments.each do |comment|
      json.set! comment.id do
        json.extract! comment, :id, :post_id, :parent_id, :created_at, :updated_at
        json.deleted comment.deleted?
        json.body(comment.deleted? ? nil : comment.body)
        json.author do
          if comment.deleted?
            json.null!
          else
            json.partial! 'api/users/user', user: comment.user
          end
        end
        json.reply_count @reply_counts.fetch(comment.id, 0)
      end
    end
  end
end
json.comment_ids @comments.map(&:id)
json.pagination @pagination
