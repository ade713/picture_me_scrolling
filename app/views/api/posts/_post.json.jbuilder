json.extract! post, :id, :title, :body, :post_type,
                    :url, :author_id, :likes
json.image_url asset_path(post.image.url)
json.author post.author.username
json.author_avatar post.author.avatar.url
json.likes post.likes.count
json.liked post.likers_ids.include?(current_user.id)
#post.likes.couunt map each post to like since likes is an array
#json current user likes . includes post.likes

#use boolean for follower and followee
