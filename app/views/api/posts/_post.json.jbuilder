json.extract! post, :id, :title, :body, :post_type,
                    :url, :author_id, :likes
json.image_url asset_path(post.image.url)
json.author post.author.username
json.author_avatar post.author.avatar.url
