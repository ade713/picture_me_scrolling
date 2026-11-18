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
json.reply_count reply_count
