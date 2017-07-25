class AddPostType < ActiveRecord::Migration[5.0]
  def change
    add_column :posts, :post_type, :string
  end
end
