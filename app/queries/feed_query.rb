class FeedQuery
  DEFAULT_PAGE = 1
  DEFAULT_PER_PAGE = 20
  MAX_PER_PAGE = 50

  def self.call(user:, page: nil, per_page: nil)
    new(user: user, page: page, per_page: per_page).call
  end

  def initialize(user:, page: nil, per_page: nil)
    @user = user
    @page = page
    @per_page = per_page
  end

  def call
    posts = feed_posts
    pagination = pagination_for(posts.count)

    [
      posts.offset(pagination[:offset]).limit(pagination[:per_page]),
      pagination
    ]
  end

  private

  attr_reader :user, :page, :per_page

  def feed_posts
    Post.where(author_id: user.id)
        .or(Post.where(author_id: followed_author_ids))
        .order(created_at: :desc, id: :desc)
  end

  def followed_author_ids
    Follow.where(follower_id: user.id).select(:followee_id)
  end

  def pagination_for(total_count)
    current_page = normalized_page
    current_per_page = normalized_per_page
    total_pages = (total_count.to_f / current_per_page).ceil

    {
      has_more: current_page < total_pages,
      offset: (current_page - 1) * current_per_page,
      page: current_page,
      per_page: current_per_page,
      total_count: total_count,
      total_pages: total_pages
    }
  end

  def normalized_page
    [integer_param(page, DEFAULT_PAGE), DEFAULT_PAGE].max
  end

  def normalized_per_page
    integer_param(per_page, DEFAULT_PER_PAGE).clamp(1, MAX_PER_PAGE)
  end

  def integer_param(value, fallback)
    return fallback if value.nil?

    value.to_i
  end
end
