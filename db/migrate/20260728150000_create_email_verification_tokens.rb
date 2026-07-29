class CreateEmailVerificationTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :email_verification_tokens do |t|
      t.references :user,
                   null: false,
                   type: :integer,
                   foreign_key: { on_delete: :cascade },
                   index: { unique: true }
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :email_verification_tokens, :token_digest, unique: true
    add_index :email_verification_tokens, :expires_at
  end
end
