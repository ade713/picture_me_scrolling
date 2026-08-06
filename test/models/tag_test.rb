# == Schema Information
#
# Table name: tags
#
#  id         :bigint           not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class TagTest < ActiveSupport::TestCase
  test 'normalizes surrounding whitespace and case' do
    tag = Tag.create!(name: '  Street_Photography  ')

    assert_equal 'street_photography', tag.name
  end

  test 'requires a name' do
    tag = Tag.new(name: '   ')

    refute tag.valid?
    assert_equal ["can't be blank"], tag.errors[:name]
  end

  test 'limits name length' do
    tag = Tag.new(name: 'a' * 31)

    refute tag.valid?
    assert_includes tag.errors[:name],
                    'is too long (maximum is 30 characters)'
  end

  test 'accepts supported name formats' do
    %w[nature travel2026 street_photography].each do |name|
      assert Tag.new(name: name).valid?, "expected #{name.inspect} to be valid"
    end
  end

  test 'rejects unsupported name formats' do
    invalid_names = [
      'street-photography',
      'street photography',
      '_photography',
      'photography_',
      'street__photography',
      'photography!'
    ]

    invalid_names.each do |name|
      tag = Tag.new(name: name)

      refute tag.valid?, "expected #{name.inspect} to be invalid"
      assert_includes tag.errors[:name], 'is invalid'
    end
  end

  test 'prevents duplicates after normalization' do
    duplicate = Tag.new(name: ' PHOTOGRAPHY ')

    refute duplicate.valid?
    assert_includes duplicate.errors[:name], 'has already been taken'
  end

  test 'returns associated posts' do
    assert_equal [posts(:one)], tags(:photography).posts.to_a
  end
end
