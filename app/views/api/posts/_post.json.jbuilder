json.extract! post, :id, :title, :body, :post_type,
                    :url, :author_id, :likes
json.image_url post.image.attached? ? url_for(post.image) : nil
json.author post.author.username
json.followed post.followers_ids.include?(current_user.id)
json.author_avatar post.author.avatar.attached? ? url_for(post.author.avatar) : nil
json.likes post.likes.count
json.liked post.likers_ids.include?(current_user.id)
