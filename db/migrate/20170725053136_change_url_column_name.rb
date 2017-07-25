class ChangeUrlColumnName < ActiveRecord::Migration[5.0]
  def change
    rename_column :posts, :url, :source
  end
end
