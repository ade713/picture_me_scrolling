require 'test_helper'

class DemoSeedTest < ActiveSupport::TestCase
  test 'creates demo users posts and follows' do
    DemoSeed.run

    guest = User.find_by!(username: DemoSeed::GUEST_USERNAME)
    demo_users = User.where(username: DemoSeed.demo_usernames)
    followed_users = User.where(username: DemoSeed::FOLLOWED_USERS)
    recommended_users = User.where(username: DemoSeed::RECOMMENDED_USERS)
    profile_users = User.where(username: DemoSeed.profile_usernames)
    profile_post_author = followed_users.find_by!(username: DemoSeed::FOLLOWED_USERS.first)
    demo_posts = Post.where(author_id: demo_users.select(:id))

    assert_equal DemoSeed.demo_usernames.length, demo_users.count
    assert_equal DemoSeed::FOLLOWED_USERS.length, followed_users.count
    assert_equal DemoSeed::RECOMMENDED_USERS.length, recommended_users.count
    assert_equal DemoSeed::PROFILE_RELATIONSHIP_COUNT, profile_users.count
    refute profile_users.where(password_digest: guest.password_digest).exists?
    assert_equal DemoSeed::FOLLOWED_USERS.length,
                 Follow.where(follower_id: guest.id, followee_id: followed_users.select(:id)).count
    assert_equal DemoSeed::PROFILE_RELATIONSHIP_COUNT,
                 Follow.where(follower_id: profile_users.select(:id), followee_id: guest.id).count
    assert_equal DemoSeed::PROFILE_RELATIONSHIP_COUNT,
                 Follow.where(follower_id: guest.id, followee_id: profile_users.select(:id)).count
    assert_equal 25, demo_posts.count
    assert_equal 8, demo_posts.where(post_type: 'link').count
    assert_equal 18, demo_posts.joins(:tags).where(tags: { name: 'demo_feed' }).count
    assert_equal 12, Post.where(author_id: profile_post_author.id).count
    assert_equal %w[demo_feed text], demo_posts.find_by!(title: 'Demo feed text 01').tags.order(:name).pluck(:name)
  end

  test 'can run repeatedly without duplicating demo records' do
    DemoSeed.run

    demo_users = User.where(username: DemoSeed.demo_usernames)
    profile_users = User.where(username: DemoSeed.profile_usernames)
    guest = User.find_by!(username: DemoSeed::GUEST_USERNAME)
    initial_counts = {
      users: demo_users.count,
      profile_users: profile_users.count,
      posts: Post.where(author_id: demo_users.select(:id)).count,
      follows: Follow.where(follower_id: guest.id).count,
      profile_relationships: Follow.where(
        follower_id: profile_users.select(:id),
        followee_id: guest.id
      ).count,
      post_tags: PostTag.joins(:post).where(posts: { author_id: demo_users.select(:id) }).count,
      comments: Comment.count
    }

    DemoSeed.run

    demo_users = User.where(username: DemoSeed.demo_usernames)
    profile_users = User.where(username: DemoSeed.profile_usernames)
    guest = User.find_by!(username: DemoSeed::GUEST_USERNAME)
    assert_equal initial_counts[:users], demo_users.count
    assert_equal initial_counts[:comments], Comment.count
    assert_equal initial_counts[:profile_users], profile_users.count
    assert_equal initial_counts[:posts], Post.where(author_id: demo_users.select(:id)).count
    assert_equal initial_counts[:follows], Follow.where(follower_id: guest.id).count
    assert_equal initial_counts[:profile_relationships],
                 Follow.where(
                   follower_id: profile_users.select(:id),
                   followee_id: guest.id
                 ).count
    assert_equal initial_counts[:post_tags],
                 PostTag.joins(:post).where(posts: { author_id: demo_users.select(:id) }).count
  end

  test 'keeps unrelated records intact' do
    existing_user = User.create!(username: 'Existing Production User', password: 'password')
    existing_post = Post.create!(author_id: existing_user.id, title: 'Existing post', body: 'Keep me', post_type: 'text')
    existing_comment = Comment.create!(post: existing_post, user: existing_user, body: 'Keep my comment')

    DemoSeed.run

    assert User.exists?(existing_user.id)
    assert Post.exists?(existing_post.id)
    assert_equal 'Keep my comment', existing_comment.reload.body
  end

  test 'seeds paginated discussions and preserves edited comments and deleted parents on rerun' do
    DemoSeed.run
    writer = User.find_by!(username: DemoSeed::FOLLOWED_USERS.first)
    quote_maker = User.find_by!(username: DemoSeed::FOLLOWED_USERS.last)
    post = writer.posts.find_by!(title: 'Demo feed text 01')
    parents = post.comments.where(parent_id: nil).order(:created_at).to_a

    # Cover pagination, reply counts, deleted parents, and varied authors/bodies.
    assert_equal 23, parents.length
    assert_equal 17, parents.last.replies.count
    assert_equal 1, parents[-2].replies.count
    deleted_parent = parents[-3]
    assert deleted_parent.deleted?
    assert_nil deleted_parent.body
    assert_nil deleted_parent.user_id
    assert_equal 2, deleted_parent.replies.count
    assert_equal 3, post.comments.where.not(user_id: nil).distinct.count(:user_id)
    assert post.comments.exists?(body: 'A' * 1_000)

    # Keep single-comment and empty preview examples available on a fresh run.
    single = quote_maker.posts.find_by!(title: 'Demo feed quote 02')
    empty = quote_maker.posts.find_by!(title: 'Demo feed text 04')
    assert_equal 1, single.comments.count
    assert_equal 0, empty.comments.count

    # Rerunning must preserve edits and tombstones without duplicating replies.
    parents.first.update!(body: 'Edited during a demo')
    DemoSeed.run
    assert_equal 'Edited during a demo', parents.first.reload.body
    assert deleted_parent.reload.deleted?
    assert_equal 2, deleted_parent.replies.count
    assert_equal 17, parents.last.replies.count
  end
end
