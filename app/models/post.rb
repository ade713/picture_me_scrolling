# == Schema Information
#
# Table name: posts
#
#  id          :integer          not null, primary key
#  title       :string           not null
#  url         :text
#  body        :text
#  likes_count :integer          not null
#  author_id   :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Post < ApplicationRecord
  validates :title, :likes_count, :author_id, presence: true

  belongs_to :author,
    primary_key: :id,
    foreign_key: :author_id,
    class_name: "User"
end
