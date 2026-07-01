# == Schema Information
#
# Table name: likes
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  post_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class LikeTest < ActiveSupport::TestCase
  test 'database prevents duplicate user post likes' do
    attributes = {
      user_id: users(:one).id,
      post_id: posts(:one).id,
      created_at: Time.current,
      updated_at: Time.current
    }

    Like.delete_all
    Like.insert_all!([attributes])

    assert_raises ActiveRecord::RecordNotUnique do
      Like.insert_all!([attributes])
    end
  end
end
