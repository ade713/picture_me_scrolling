require 'open-uri'

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or create!d alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create!([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create!(name: 'Luke', movie: movies.first)
Like.destroy_all
Follow.destroy_all
Post.destroy_all
User.destroy_all

def attach_remote_file(record, attachment_name, url)
  return if url.blank?

  file = URI.open(url)
  filename = File.basename(URI.parse(url).path)

  record.public_send(attachment_name).attach(
    io: file,
    filename: filename,
    content_type: file.content_type
  )
end

def create_user!(attributes)
  avatar_url = attributes.delete(:avatar)
  user = User.create!(attributes)
  attach_remote_file(user, :avatar, avatar_url)
  user
end

def create_post!(attributes)
  image_url = attributes.delete(:image)
  tag_names = attributes.delete(:tags)
  result = PostWriter.new(post: Post.new, attributes: attributes, tag_names: tag_names).call
  raise "Post seed failed: #{result.errors.join(', ')}" unless result.success?

  post = result.post
  attach_remote_file(post, :image, image_url)
  post
end

def create_follow!(follower:, followee:)
  Follow.create!(
    follower_id: follower.id,
    followee_id: followee.id
  )
end

def create_like!(user:, post:)
  Like.create!(
    user_id: user.id,
    post_id: post.id
  )
end

guest_user1 = create_user!(username: 'PicMeS Guest', password: '1Welcome2To3PicMeS', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/orange_happy.png')

akuma = create_user!(username: 'DarkHadouMaster', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/akuma-sf3.jpg')
ryu = create_user!(username: 'Ryu', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/ryu_sf.gif')
guile1 = create_user!(username: 'Guile', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/guile_avatar.png')
bobsburger = create_user!(username: 'BurgersByBob', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/bobs_burgers_avatar.jpg')
starwars = create_user!(username: 'eps4thru6', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/storm_trooper_avatar.jpg')
rick = create_user!(username: 'WorldsSmartestGenius', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/tiny_rick_avatar.jpg')
morty = create_user!(username: 'Morty', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/morty_r-and-m_avatar.jpg')
jerome = create_user!(username: 'Jerome', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/jerome_martin.jpg')
luffy = create_user!(username: 'Strawhat Luffy ', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/luffy_avatar.png')
ace = create_user!(username: 'FireFistAce', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/Ace+-+One+Piece.jpg')
starks = create_user!(username: 'Direwolf Family', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/house_stark_avatar.jpg')
kermit = create_user!(username: 'Kermit', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/kermit_tea_avatar.jpg')
fozzie = create_user!(username: 'FozzieBear', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/fozzie_avatar.jpg')
miles = create_user!(username: 'CoffeeSpidey', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/miles_morales.jpg')
silky = create_user!(username: 'SilkyJ02', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/silky_johnson1_avatar.jpg')
dbz = create_user!(username: 'SonGohan', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/gohan_ssj2.jpg')
create_post!(author_id: guest_user1.id, title: "Welcome to PicMeS", body: "Use the recommended users list to test follow and feed updates.", post_type: 'text', tags: %w[community welcome])
create_post!(author_id: starwars.id, title: "That moment when he tells you he's your daddy", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/Darth+Vader+Father.jpg', tags: %w[movies star_wars])
create_post!(author_id: miles.id, title: "With great power, comes great responsibilities", body: "Ben Parker", post_type: 'quote', tags: %w[comics inspiration])
create_post!(author_id: silky.id, title: "I will be the player hater of the year again!", body: "No one can beat me!!!", post_type: 'text')
create_post!(author_id: starks.id, title: "Winter... Is... Here", post_type: 'text', tags: %w[fantasy winter])
create_post!(author_id: guile1.id, title: "Stepping back in the ring!", post_type: 'video', image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/guile+sfv+trailer.mp4')
create_post!(author_id: dbz.id, title: "Even MJ had the power insideh home", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/mj_ssj.gif')
create_post!(author_id: jerome.id, title: "Jerome is king of da playas!", body: 'Silky never had a chance', post_type: 'text')
create_post!(author_id: akuma.id, title: "I am your worst nightmare... !", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/akuma_dark.jpg')
create_post!(author_id: luffy.id, title: "Brother of the year!!", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/ace_fire.gif')
create_post!(author_id: jerome.id, title: "Steppin in mah phresh kix (watch yo mouf)", post_type: 'video', image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/martin_jerome_white_shoes.mp4')
create_post!(author_id: kermit.id, title: "I'm interested in this phone", url: 'https://www.youtube.com/watch?v=l5nv86zjPro&t=19s', post_type: 'link')
create_post!(author_id: starks.id, title: "The cavalry is here... #Drogon", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/drogon.gif')
create_post!(author_id: fozzie.id, title: "Picmes is AWESOME! =D #WakaWaka", post_type: 'text')

# Follow relationships keep local feed behavior predictable:
# - the guest starts with followed posts in the feed
# - recommended users still include users with posts, like DarkHadouMaster
# - recommended users have posts that become visible after follow actions
create_follow!(follower: guest_user1, followee: starwars)
create_follow!(follower: guest_user1, followee: starks)

# Performance scenario data:
# These records create enough local feed volume to evaluate pagination,
# rendering, and query behavior without repeatedly downloading large media.
performance_avatar_urls = [
  'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/orange_happy.png',
  'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/storm_trooper_avatar.jpg',
  'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/miles_morales.jpg',
  'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/kermit_tea_avatar.jpg'
]

performance_users = 24.times.map do |index|
  create_user!(
    username: format('PerformanceUser%02d', index + 1),
    password: 'pass123',
    avatar: performance_avatar_urls[index % performance_avatar_urls.length]
  )
end

performance_text_bodies = [
  'Testing the feed with enough posts to make scrolling behavior obvious.',
  'A realistic dashboard needs more than a handful of records.',
  'This post exists so pagination decisions can be based on volume.',
  'Performance work is easier when the seed data tells the truth.'
]

performance_quote_sources = [
  'The Feed Lab',
  'Dashboard Notes',
  'Pagination Club',
  'Seed Data Society'
]

performance_links = [
  'https://guides.rubyonrails.org/',
  'https://react.dev/',
  'https://tanstack.com/query/latest',
  'https://webpack.js.org/'
]

performance_posts = []

performance_users.each_with_index do |user, user_index|
  5.times do |post_index|
    sequence = (user_index * 5) + post_index + 1

    performance_posts << case post_index % 3
    when 0
      create_post!(
        author_id: user.id,
        title: "Performance text post #{sequence}",
        body: performance_text_bodies[sequence % performance_text_bodies.length],
        post_type: 'text',
        tags: %w[performance text]
      )
    when 1
      create_post!(
        author_id: user.id,
        title: "Quote seed #{sequence}",
        body: "- #{performance_quote_sources[sequence % performance_quote_sources.length]}",
        post_type: 'quote',
        tags: %w[performance quotes]
      )
    else
      create_post!(
        author_id: user.id,
        title: "Useful reference #{sequence}",
        url: performance_links[sequence % performance_links.length],
        post_type: 'link',
        tags: %w[links performance]
      )
    end
  end
end

# These unfollowed users appear early in the guest's recommended users list.
# Creating their posts after the performance data makes follow-driven feed
# updates easier to confirm near the top of the feed during smoke testing.
create_post!(author_id: ryu.id, title: "Back to training", body: "A quiet morning before the next match.", post_type: 'text')
create_post!(author_id: ryu.id, title: "Frame data notes", url: 'https://wiki.supercombo.gg/w/Street_Fighter_6/Ryu', post_type: 'link')
create_post!(author_id: bobsburger.id, title: "Burger of the day", body: "The Smoke Test Swiss is back on the board.", post_type: 'text')
create_post!(author_id: bobsburger.id, title: "Recipe inspiration", url: 'https://www.seriouseats.com/hamburger-recipes-5117825', post_type: 'link')
create_post!(author_id: rick.id, title: "Portal notes", body: "- Garage Lab", post_type: 'quote')
create_post!(author_id: rick.id, title: "Dimension C-137 checklist", body: "Calibrate portal fluid before touching production.", post_type: 'text')
create_post!(author_id: morty.id, title: "Aw geez, another timeline", body: "Trying to keep the dashboard stable.", post_type: 'text')
create_post!(author_id: morty.id, title: "Study guide for chaos", url: 'https://en.wikipedia.org/wiki/Butterfly_effect', post_type: 'link')

performance_users.each do |user|
  create_follow!(follower: guest_user1, followee: user)
end

performance_users.each_slice(4) do |user_group|
  user_group.combination(2) do |follower, followee|
    create_follow!(follower: follower, followee: followee)
  end
end

like_users = [guest_user1, akuma, ryu, bobsburger, rick, morty] + performance_users.first(8)

performance_posts.each_with_index do |post, index|
  like_users.each_with_index do |user, user_index|
    create_like!(user: user, post: post) if (index + user_index).even?
  end
end
