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

require 'test_helper'

class PostTest < ActiveSupport::TestCase
  test 'post type must be supported' do
    post = Post.new(title: 'Unsupported post', author_id: 1, post_type: 'document')

    refute post.valid?
    assert_includes post.errors[:post_type], 'is not included in the list'
end
end
