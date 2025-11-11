class RemovePostAuthorIdIndex < ActiveRecord::Migration[7.1]
  def change
    remove_index :posts, :author_id
  end
end
