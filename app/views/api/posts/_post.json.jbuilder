json.extract! post, :id, :title, :body, :post_type,
                    :url, :author_id
json.image_url post.image.attached? ? url_for(post.image) : nil
json.author post.author.username
json.tags post.tags.map(&:name).sort

comment_previews = @comment_previews || CommentPreviewsQuery.call(post_ids: [post.id])
json.comment_previews comment_previews.fetch(post.id, []) do |comment|
  json.extract! comment, :id, :body, :created_at
  json.author do
    json.partial! 'api/users/user', user: comment.user
  end
end

if @followed_author_ids
  json.followed @followed_author_ids.include?(post.author_id)
else
  json.followed Follow.exists?(
    follower_id: current_user.id,
    followee_id: post.author_id
  )
end

json.author_avatar avatar_url_for(post.author)
post_like_count = if @post_like_counts
                    @post_like_counts.fetch(post.id, 0)
                  else
                    post.likes.count
                  end
json.likes post_like_count

if @liked_post_ids
  json.liked @liked_post_ids.include?(post.id)
else
  json.liked Like.exists?(
    user_id: current_user.id,
    post_id: post.id
  )
end
