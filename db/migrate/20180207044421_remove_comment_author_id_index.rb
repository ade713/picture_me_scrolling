class RemoveCommentAuthorIdIndex < ActiveRecord::Migration[5.0]
  def change
    remove_index :comments, :author_id
  end
end
