class CreateComments < ActiveRecord::Migration[7.1]
  def change
    create_table :comments do |t|
      t.text :body
      t.references :user, type: :integer, foreign_key: true
      t.references :post, type: :integer, null: false, foreign_key: true, index: false
      t.references :parent, foreign_key: { to_table: :comments }, index: false
      t.datetime :deleted_at
      t.timestamps
    end

    add_index :comments, [:post_id, :parent_id, :created_at, :id],
              name: 'index_comments_on_post_thread_order'
    add_index :comments, [:parent_id, :created_at, :id],
              name: 'index_comments_on_reply_order'
  end
end
