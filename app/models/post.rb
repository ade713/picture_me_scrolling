# == Schema Information
#
# Table name: posts
#
#  id                 :integer          not null, primary key
#  title              :string           not null
#  url                :text
#  body               :text
#  likes_count        :integer          not null
#  author_id          :integer          not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  image_file_name    :string
#  image_content_type :string
#  image_file_size    :integer
#  image_updated_at   :datetime
#  post_type          :string
#

class Post < ApplicationRecord
  validates :title, :likes_count, :author_id, presence: true

  belongs_to :author,
    primary_key: :id,
    foreign_key: :author_id,
    class_name: "User"

  has_attached_file :image, default_url: "orange_happy.png"
  validates_attachment_content_type :image,
    content_type: [/\Aimage\/.*\z/, 'audio/mp3', 'audio/mpeg', 'audio/wav', 'video/avi', 'video/mp4']
  validates_attachment_size :image, in: 0..10.megabyte
end
