require 'test_helper'

class StaticPagesControllerTest < ActionDispatch::IntegrationTest
  test 'app shell uses device width without restricting zoom' do
    get '/'

    assert_response :success
    assert_select 'meta[name="viewport"]', count: 1 do |elements|
      assert_equal 'width=device-width, initial-scale=1', elements.first['content']
    end
  end
end
