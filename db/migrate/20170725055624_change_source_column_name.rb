class ChangeSourceColumnName < ActiveRecord::Migration[7.1]
  def change
    rename_column :posts, :source, :url
  end
end
