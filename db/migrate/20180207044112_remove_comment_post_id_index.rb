class RemoveCommentPostIdIndex < ActiveRecord::Migration[5.0]
  def change
    remove_index :comments, :post_id
  end
end
