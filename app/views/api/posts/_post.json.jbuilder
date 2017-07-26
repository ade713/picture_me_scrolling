json.extract! post, :id, :title, :body, :post_type,
                    :likes_count, :url, :author_id, :created_at
json.image_url asset_path(post.image.url)
