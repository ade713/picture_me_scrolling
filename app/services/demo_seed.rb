# Production-safe demo data helpers.
module DemoSeed
  module_function

  GUEST_USERNAME = User::SHARED_GUEST_USERNAME
  DEFAULT_PASSWORD = '1Welcome2To3PicMeS'.freeze
  DEMO_PASSWORD = 'pass123'.freeze
  PROFILE_RELATIONSHIP_COUNT = 1_001
  PROFILE_USER_PREFIX = 'Demo Profile User'.freeze

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

    create_profile_relationships(guest, seeded_at: seeded_at)

    create_feed_posts(followed_users, seeded_at: seeded_at)
    create_profile_posts(followed_users.first, seeded_at: seeded_at)
    create_recommended_user_posts(recommended_users, seeded_at: seeded_at)

    puts "Demo seed complete: #{User.where(username: demo_usernames).count} content users " \
         "and #{User.where(username: profile_usernames).count} profile users available."
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
          post_type: Post::TYPES.fetch(:text),
          tags: %w[demo_feed text],
          created_at: seeded_at - (sequence + 10).minutes
        )
      when 1
        upsert_post(
          author: author,
          title: format('Demo feed quote %02d', sequence),
          body: "- #{QUOTE_SOURCES[index % QUOTE_SOURCES.length]}",
          post_type: Post::TYPES.fetch(:quote),
          tags: %w[demo_feed quotes],
          created_at: seeded_at - (sequence + 10).minutes
        )
      else
        upsert_post(
          author: author,
          title: format('Demo feed link %02d', sequence),
          url: LINK_URLS[index % LINK_URLS.length],
          post_type: Post::TYPES.fetch(:link),
          tags: %w[demo_feed links],
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
        post_type: Post::TYPES.fetch(:text),
        tags: %w[recommended text],
        created_at: seeded_at - index.minutes
      )

      upsert_post(
        author: author,
        title: "Recommended demo link #{index + 1}",
        url: LINK_URLS[index % LINK_URLS.length],
        post_type: Post::TYPES.fetch(:link),
        tags: %w[links recommended],
        created_at: seeded_at - (index + users.length).minutes
      )
    end
  end

  def create_profile_posts(author, seeded_at:)
    3.times do |index|
      sequence = index + 1
      upsert_post(
        author: author,
        title: format('Profile showcase text %02d', sequence),
        body: 'This post keeps profile pagination available for portfolio review.',
        post_type: Post::TYPES.fetch(:text),
        tags: %w[profile_showcase text],
        created_at: seeded_at - (sequence + 40).minutes
      )
    end
  end

  def create_profile_relationships(guest, seeded_at:)
    profile_user_ids = upsert_profile_users(guest, seeded_at: seeded_at)
    relationship_rows = profile_user_ids.flat_map do |user_id|
      [
        follow_attributes(follower_id: user_id, followee_id: guest.id, seeded_at: seeded_at),
        follow_attributes(follower_id: guest.id, followee_id: user_id, seeded_at: seeded_at)
      ]
    end
    Follow.insert_all(
      relationship_rows,
      unique_by: :index_follows_on_follower_id_and_followee_id
    )
  end

  def upsert_profile_users(guest, seeded_at:)
    usernames = profile_usernames
    missing_users = usernames - User.where(username: usernames).pluck(:username)

    if missing_users.any?
      # One unknown digest keeps showcase users inaccessible without performing
      # 1,001 BCrypt operations.
      password_digest = BCrypt::Password.create(SecureRandom.urlsafe_base64(32)).to_s
      user_rows = missing_users.map do |username|
        {
          username: username,
          password_digest: password_digest,
          session_token: SecureRandom.urlsafe_base64,
          created_at: seeded_at,
          updated_at: seeded_at
        }
      end
      User.insert_all(user_rows, unique_by: :index_users_on_username)
    end

    User.where(username: usernames).pluck(:id)
  end

  def follow_attributes(follower_id:, followee_id:, seeded_at:)
    {
      follower_id: follower_id,
      followee_id: followee_id,
      created_at: seeded_at,
      updated_at: seeded_at
    }
  end

  def upsert_post(author:, title:, post_type:, tags:, body: nil, url: nil, created_at: nil)
    post = Post.find_or_initialize_by(author_id: author.id, title: title, post_type: post_type)
    attributes = { body: body, url: url }
    attributes[:created_at] = created_at if created_at
    result = PostWriter.new(post: post, attributes: attributes, tag_names: tags).call
    raise "Demo post seed failed: #{result.errors.join(', ')}" unless result.success?

    result.post
  end

  def ensure_follow(follower:, followee:)
    Follow.find_or_create_by!(follower_id: follower.id, followee_id: followee.id)
  end

  def demo_usernames
    [GUEST_USERNAME] + FOLLOWED_USERS + RECOMMENDED_USERS
  end

  def profile_usernames
    @profile_usernames ||= Array.new(PROFILE_RELATIONSHIP_COUNT) do |index|
      format('%s %04d', PROFILE_USER_PREFIX, index + 1)
    end.freeze
  end
end
