# Unlike `rails db:seed`, this task never destroys existing records. It creates
# or updates a small, stable set of demo users, follows, and text/link/quote
# posts that are safe to refresh before broader release.

namespace :demo do
  desc 'Create or update production-safe demo data without deleting existing records'
  task seed: :environment do
    DemoSeed.run
  end
end
