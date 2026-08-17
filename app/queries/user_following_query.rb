class UserFollowingQuery
  include QueryPagination

  def self.call(user:, page: nil, per_page: nil)
    new(user: user, page: page, per_page: per_page).call
  end

  def initialize(user:, page: nil, per_page: nil)
    @user = user
    @page = page
    @per_page = per_page
  end

  def call
    relationships, pagination = paginate(following_relationships)

    [relationships.map(&:followee), pagination]
  end

  private

  attr_reader :user, :page, :per_page

  def following_relationships
    Follow.where(follower_id: user.id)
          .includes(followee: { avatar_attachment: :blob })
          .order(created_at: :desc, id: :desc)
  end
end
