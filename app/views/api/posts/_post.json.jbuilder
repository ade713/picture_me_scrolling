json.extract! post, :id, :title, :body, :post_type,
                    :url, :author_id, :likes
json.image_url asset_path(post.image.url)
json.author post.author.username
json.followers post.author.followers
json.author_avatar post.author.avatar.url
json.likes post.likes.count
json.liked post.likers_ids.include?(current_user.id)
