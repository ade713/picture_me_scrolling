require 'test_helper'

class DemoSeedTest < ActiveSupport::TestCase
  test 'creates demo users posts and follows' do
    DemoSeed.run

    guest = User.find_by!(username: DemoSeed::GUEST_USERNAME)
    demo_users = User.where(username: DemoSeed.demo_usernames)
    followed_users = User.where(username: DemoSeed::FOLLOWED_USERS)
    recommended_users = User.where(username: DemoSeed::RECOMMENDED_USERS)
    demo_posts = Post.where(author_id: demo_users.select(:id))

    assert_equal DemoSeed.demo_usernames.length, demo_users.count
    assert_equal DemoSeed::FOLLOWED_USERS.length, followed_users.count
    assert_equal DemoSeed::RECOMMENDED_USERS.length, recommended_users.count
    assert_equal DemoSeed::FOLLOWED_USERS.length,
                 Follow.where(follower_id: guest.id, followee_id: followed_users.select(:id)).count
    assert_equal 22, demo_posts.count
    assert_equal 8, demo_posts.where(post_type: 'link').count
  end

  test 'can run repeatedly without duplicating demo records' do
    DemoSeed.run

    demo_users = User.where(username: DemoSeed.demo_usernames)
    guest = User.find_by!(username: DemoSeed::GUEST_USERNAME)
    initial_counts = {
      users: demo_users.count,
      posts: Post.where(author_id: demo_users.select(:id)).count,
      follows: Follow.where(follower_id: guest.id).count
    }

    DemoSeed.run

    demo_users = User.where(username: DemoSeed.demo_usernames)
    guest = User.find_by!(username: DemoSeed::GUEST_USERNAME)
    assert_equal initial_counts[:users], demo_users.count
    assert_equal initial_counts[:posts], Post.where(author_id: demo_users.select(:id)).count
    assert_equal initial_counts[:follows], Follow.where(follower_id: guest.id).count
  end

  test 'keeps unrelated records intact' do
    existing_user = User.create!(username: 'Existing Production User', password: 'password')
    existing_post = Post.create!(author_id: existing_user.id, title: 'Existing post', body: 'Keep me', post_type: 'text')

    DemoSeed.run

    assert User.exists?(existing_user.id)
    assert Post.exists?(existing_post.id)
  end
end
