class CreateTagsAndPostTags < ActiveRecord::Migration[7.1]
  def change
    create_table :tags do |t|
      t.string :name, null: false

      t.timestamps
    end
    add_index :tags, :name, unique: true

    create_table :post_tags do |t|
      t.references :post,
                   null: false,
                   type: :integer,
                   foreign_key: { on_delete: :cascade }
      t.references :tag,
                   null: false,
                   foreign_key: { on_delete: :cascade }

      t.timestamps

      t.index %i[post_id tag_id], unique: true
    end
  end
end
