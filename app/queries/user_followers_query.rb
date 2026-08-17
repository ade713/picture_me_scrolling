class UserFollowersQuery
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
    relationships, pagination = paginate(follower_relationships)

    [relationships.map(&:follower), pagination]
  end

  private

  attr_reader :user, :page, :per_page

  def follower_relationships
    Follow.where(followee_id: user.id)
          .includes(follower: { avatar_attachment: :blob })
          .order(created_at: :desc, id: :desc)
  end
end
