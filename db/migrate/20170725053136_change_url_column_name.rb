class ChangeUrlColumnName < ActiveRecord::Migration[7.1]
  def change
    rename_column :posts, :url, :source
  end
end
