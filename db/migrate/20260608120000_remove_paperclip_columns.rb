class RemovePaperclipColumns < ActiveRecord::Migration[7.1]
  def change
    remove_column :users, :avatar_file_name, :string
    remove_column :users, :avatar_content_type, :string
    remove_column :users, :avatar_file_size, :integer
    remove_column :users, :avatar_updated_at, :datetime

    remove_column :posts, :image_file_name, :string
    remove_column :posts, :image_content_type, :string
    remove_column :posts, :image_file_size, :integer
    remove_column :posts, :image_updated_at, :datetime
  end
end
