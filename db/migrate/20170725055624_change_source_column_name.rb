class ChangeSourceColumnName < ActiveRecord::Migration[5.0]
  def change
    rename_column :posts, :source, :url
  end
end
