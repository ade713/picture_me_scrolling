class AddPostType < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :post_type, :string
  end
end
