require 'test_helper'
require 'minitest/mock'

class HealthControllerTest < ActionDispatch::IntegrationTest
  test 'show returns ok when the app and database are reachable' do
    get up_url

    assert_response :success
    assert_equal({ 'status' => 'ok' }, response_json)
  end

  test 'show returns unavailable when the database check fails' do
    ActiveRecord::Base.connection.stub(:execute, ->(_query) { raise ActiveRecord::ConnectionNotEstablished }) do
      get up_url
    end

    assert_response :service_unavailable
    assert_equal({ 'status' => 'unavailable' }, response_json)
  end

  private

  def response_json
    JSON.parse(response.body)
  end
end
