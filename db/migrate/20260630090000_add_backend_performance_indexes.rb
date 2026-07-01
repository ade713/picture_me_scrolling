class AddBackendPerformanceIndexes < ActiveRecord::Migration[7.1]
  def change
    add_index :likes,
              [:user_id, :post_id],
              unique: true,
              name: "index_likes_on_user_id_and_post_id"

    add_index :follows,
              [:follower_id, :followee_id],
              unique: true,
              name: "index_follows_on_follower_id_and_followee_id"

    add_index :posts,
              [:author_id, :created_at, :id],
              name: "index_posts_on_author_id_created_at_id"
  end
end
