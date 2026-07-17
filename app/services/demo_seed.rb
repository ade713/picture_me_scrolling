# Production-safe demo data helpers.
module DemoSeed
  module_function

  GUEST_USERNAME = 'PicMeS Guest'.freeze
  DEFAULT_PASSWORD = '1Welcome2To3PicMeS'.freeze
  DEMO_PASSWORD = 'pass123'.freeze

  FOLLOWED_USERS = [
    'Demo Feed Writer',
    'Demo Quote Maker'
  ].freeze

  RECOMMENDED_USERS = [
    'Demo Link Curator',
    'Demo Visual Notes'
  ].freeze

  LINK_URLS = [
    'https://guides.rubyonrails.org/',
    'https://react.dev/',
    'https://tanstack.com/query/latest',
    'https://webpack.js.org/'
  ].freeze

  TEXT_BODIES = [
    'Production smoke data should be useful without being destructive.',
    'This demo post keeps pagination and feed behavior easy to verify.',
    'A small stable seed set is enough to confirm release flows.',
    'Followed users should keep the guest feed feeling alive.'
  ].freeze

  QUOTE_SOURCES = [
    'Release Notes',
    'Smoke Test Log',
    'Demo Data Desk',
    'Production Checklist'
  ].freeze

  def run
    seeded_at = Time.current
    guest = upsert_user(username: GUEST_USERNAME, password: DEFAULT_PASSWORD)
    followed_users = FOLLOWED_USERS.map { |username| upsert_user(username: username) }
    recommended_users = RECOMMENDED_USERS.map { |username| upsert_user(username: username) }

    followed_users.each do |followee|
      ensure_follow(follower: guest, followee: followee)
    end

    create_feed_posts(followed_users, seeded_at: seeded_at)
    create_recommended_user_posts(recommended_users, seeded_at: seeded_at)

    puts "Demo seed complete: #{User.where(username: demo_usernames).count} demo users available."
  end

  def upsert_user(username:, password: DEMO_PASSWORD)
    user = User.find_or_initialize_by(username: username)
    user.password = password if user.new_record? || username == GUEST_USERNAME
    user.save!
    user
  end

  def create_feed_posts(users, seeded_at:)
    18.times do |index|
      author = users[index % users.length]
      sequence = index + 1

      case index % 3
      when 0
        upsert_post(
          author: author,
          title: format('Demo feed text %02d', sequence),
          body: TEXT_BODIES[index % TEXT_BODIES.length],
          post_type: 'text',
          created_at: seeded_at - (sequence + 10).minutes
        )
      when 1
        upsert_post(
          author: author,
          title: format('Demo feed quote %02d', sequence),
          body: "- #{QUOTE_SOURCES[index % QUOTE_SOURCES.length]}",
          post_type: 'quote',
          created_at: seeded_at - (sequence + 10).minutes
        )
      else
        upsert_post(
          author: author,
          title: format('Demo feed link %02d', sequence),
          url: LINK_URLS[index % LINK_URLS.length],
          post_type: 'link',
          created_at: seeded_at - (sequence + 10).minutes
        )
      end
    end
  end

  def create_recommended_user_posts(users, seeded_at:)
    users.each_with_index do |author, index|
      upsert_post(
        author: author,
        title: "Recommended demo text #{index + 1}",
        body: 'Follow this demo user to confirm the feed updates without a refresh.',
        post_type: 'text',
        created_at: seeded_at - index.minutes
      )

      upsert_post(
        author: author,
        title: "Recommended demo link #{index + 1}",
        url: LINK_URLS[index % LINK_URLS.length],
        post_type: 'link',
        created_at: seeded_at - (index + users.length).minutes
      )
    end
  end

  def upsert_post(author:, title:, post_type:, body: nil, url: nil, created_at: nil)
    post = Post.find_or_initialize_by(author_id: author.id, title: title, post_type: post_type)
    post.body = body
    post.url = url
    post.created_at = created_at if created_at
    post.save!
    post
  end

  def ensure_follow(follower:, followee:)
    Follow.find_or_create_by!(follower_id: follower.id, followee_id: followee.id)
  end

  def demo_usernames
    [GUEST_USERNAME] + FOLLOWED_USERS + RECOMMENDED_USERS
  end
end
