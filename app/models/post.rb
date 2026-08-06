# == Schema Information
#
# Table name: posts
#
#  id                 :integer          not null, primary key
#  title              :string           not null
#  url                :text
#  body               :text
#  author_id          :integer          not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  post_type          :string
#

class Post < ApplicationRecord
  TYPES = {
    audio: 'audio',
    link: 'link',
    photo: 'photo',
    quote: 'quote',
    text: 'text',
    video: 'video'
  }.freeze

  validates :title, :author_id, presence: true
  validates :post_type, inclusion: { in: TYPES.values }

  belongs_to :author,
    primary_key: :id,
    foreign_key: :author_id,
    class_name: "User"

  has_many :likes,
    primary_key: :id,
    foreign_key: :post_id,
    class_name: "Like"

  has_many :likers,
    through: :likes,
    source: :user

  has_many :post_tags, dependent: :destroy
  has_many :tags, through: :post_tags

  def likers_ids
    liker_ids = []
    self.likers.each do |liker|
      liker_ids << liker.id
    end

    liker_ids
  end

  def followers_ids
    follower_ids = []
    self.author.followers.each do |follow|
      follower_ids << follow.follower_id
    end

    follower_ids
  end

  has_one_attached :image
end
