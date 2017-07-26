# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


guest_user = User.create(username: 'PicMeS Guest', password: '1Welcome2To3PicMeS')

akuma = User.create(username: 'Akuma', password: 'pass123')
ryu = User.create(username: 'Ryu', password: 'pass123')
ken = User.create(username: 'Ken', password: 'pass123')
guile = User.create(username: 'Guile', password: 'pass123')
bison = User.create(username: 'Bison', password: 'pass123')
urien = User.create(username: 'Urien', password: 'pass123')

bobsburger = User.create(username: 'Bob', password: 'pass123')

gameofthrones = User.create(username: 'GameOT', password: 'pass123')

rick = User.create(username: 'Rick', password: 'pass123')
morty = User.create(username: 'Morty', password: 'pass123')
summer = User.create(username: 'Summer', password: 'pass123')
