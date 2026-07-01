# == Schema Information
#
# Table name: follows
#
#  id          :integer          not null, primary key
#  followee_id :integer          not null
#  follower_id :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

require 'test_helper'

class FollowTest < ActiveSupport::TestCase
  test 'database prevents duplicate follower followee pairs' do
    attributes = {
      follower_id: users(:one).id,
      followee_id: users(:two).id,
      created_at: Time.current,
      updated_at: Time.current
    }

    Follow.delete_all
    Follow.insert_all!([attributes])

    assert_raises ActiveRecord::RecordNotUnique do
      Follow.insert_all!([attributes])
    end
  end
end
