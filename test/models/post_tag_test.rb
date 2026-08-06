# == Schema Information
#
# Table name: post_tags
#
#  id         :bigint           not null, primary key
#  post_id    :integer          not null
#  tag_id     :bigint           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class PostTagTest < ActiveSupport::TestCase
  test 'requires a post and tag' do
    post_tag = PostTag.new

    refute post_tag.valid?
    assert_includes post_tag.errors[:post], 'must exist'
    assert_includes post_tag.errors[:tag], 'must exist'
  end

  test 'allows each tag only once per post' do
    duplicate = PostTag.new(post: posts(:one), tag: tags(:photography))

    refute duplicate.valid?
    assert_includes duplicate.errors[:tag_id], PostTag::DUPLICATE_TAG_MESSAGE
  end

  test 'allows the same tag on different posts' do
    post_tag = PostTag.new(post: posts(:two), tag: tags(:photography))

    assert post_tag.valid?
  end

  test 'database prevents duplicate post tag pairs' do
    existing = post_tags(:one)
    attributes = {
      post_id: existing.post_id,
      tag_id: existing.tag_id,
      created_at: Time.current,
      updated_at: Time.current
    }

    assert_raises ActiveRecord::RecordNotUnique do
      PostTag.insert_all!([attributes])
    end
  end
end
