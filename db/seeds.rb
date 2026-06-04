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
  post = Post.create!(attributes)
  attach_remote_file(post, :image, image_url)
  post
end

def create_follow!(follower:, followee:)
  Follow.create!(
    follower_id: follower.id,
    followee_id: followee.id
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
create_post!(author_id: guest_user1.id, title: "Welcome to PicMeS", body: "Use the recommended users list to test follow and feed updates.", post_type: 'text')
create_post!(author_id: starwars.id, title: "That moment when he tells you he's your daddy", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/dev-seeds/Darth+Vader+Father.jpg')
create_post!(author_id: miles.id, title: "With great power, comes great responsibilities", body: "Ben Parker", post_type: 'quote')
create_post!(author_id: silky.id, title: "I will be the player hater of the year again!", body: "No one can beat me!!!", post_type: 'text')
create_post!(author_id: starks.id, title: "Winter... Is... Here", post_type: 'text')
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
# - recommended users still include users without posts, like Ryu
create_follow!(follower: guest_user1, followee: starwars)
create_follow!(follower: guest_user1, followee: starks)
