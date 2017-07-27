# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
Post.destroy_all
User.destroy_all

guest_user1 = User.create(username: 'PicMeS Guest', password: '1Welcome2To3PicMeS')

akuma = User.create(username: 'DarkHadouMaster', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/akuma_ssf2.jpg')
ryu = User.create(username: 'Ryu', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/ryu_sf.gif')
guile = User.create(username: 'Guile', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/guile_avatar.png')
bobsburger = User.create(username: 'BurgersByBob', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/bobs_burgers_avatar.jpg')
starwars = User.create(username: 'eps4thru6', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/storm_trooper_avatar.jpg')
rick = User.create(username: 'WorldsSmartestGenius', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/tiny_rick_avatar.jpg')
morty = User.create(username: 'Morty', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/morty_r-and-m_avatar.jpg')
jerome = User.create(username: 'Jerome', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/jerome_martin.jpg')
luffy = User.create(username: 'Strawhat Luffy ', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/luffy_avatar.png')
ace = User.create(username: 'FireFistAce', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/ace_avatar.jpg')
starks = User.create(username: 'Direwolf Family', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/house_stark_avatar.jpg')
kermit = User.create(username: 'Kermit', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/kermit_tea_avatar.jpg')
fozzie = User.create(username: 'FozzieBear', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/fozzie_avatar.jpg')
bevo = User.create(username: 'HookEm \m/', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/hookem_avatar.jpg')
miles = User.create(username: 'CoffeeSpidey', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/miles_morales.jpg')
silky = User.create(username: 'SilkyJ02', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/silky_johnson1_avatar.jpg')
dbz = User.create(username: 'SonGohan', password: 'pass123', avatar: 'https://s3.us-east-2.amazonaws.com/picmes-dev/users/avatars/000/000/022/thumb/gohan_ssj2.jpg')


Post.create(author_id: guest_user1.id, title: "I'm interested in this phone", url: 'https://www.youtube.com/watch?v=l5nv86zjPro&t=19s', post_type: 'link')
Post.create(author_id: starwars.id, title: "That moment when he tells you he's your daddy", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/posts/images/Darth+Vader+Father.jpg')
Post.create(author_id: guile.id, title: "Stepping back in the ring!", post_type: 'video', image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/posts/video/guile+sfv+trailer.mp4')
Post.create(author_id: miles.id, title: "With great power, comes great responsibilities", body: "Ben Parker", post_type: 'quote')
Post.create(author_id: silky.id, title: "I will be the player hater of the year again!", body: "No one can beat me!!!", post_type: 'text')
Post.create(author_id: bevo.id, title: "My-start-the-day-right! music play ^_^", post_type: "audio", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/posts/images/Darth+Vader+Father.jpg')
Post.create(author_id: starks.id, title: "Winter... Is... Here", post_type: 'text')
Post.create(author_id: jerome.id, title: "Steppin in mah phresh kix (watch yo mouf)", post_type: 'video', image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/posts/video/martin_jerome_white_shoes.mp4')
Post.create(author_id: dbz.id, title: "Even MJ had the power insideh home", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/posts/images/mj_ssj.gif')
Post.create(author_id: jerome.id, title: "Jerome is king of da playas!", body: 'Silky never had a chance', post_type: 'text')
Post.create(author_id: akuma.id, title: "I am your worst nightmare... !", post_type: "photo", image: 'https://s3.us-east-2.amazonaws.com/picmes-dev/posts/images/Akuma+-+dark+colors.jpg')
