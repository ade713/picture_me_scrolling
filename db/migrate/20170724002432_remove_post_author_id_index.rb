class RemovePostAuthorIdIndex < ActiveRecord::Migration[5.0]
  def change
    remove_index :posts, :author_id
  end
end
