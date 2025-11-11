class RemoveLikesColumn < ActiveRecord::Migration[7.1]
  def change
    remove_column :posts, :likes_count
  end
end
