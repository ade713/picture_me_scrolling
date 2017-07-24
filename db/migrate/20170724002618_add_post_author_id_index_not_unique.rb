class AddPostAuthorIdIndexNotUnique < ActiveRecord::Migration[5.0]
  def change
    add_index :posts, :author_id
  end
end
