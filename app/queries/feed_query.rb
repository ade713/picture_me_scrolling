class FeedQuery
  INVALID_TAG_ERROR = 'Tag filter is invalid'.freeze

  class InvalidTagError < StandardError; end

  DEFAULT_PAGE = 1
  DEFAULT_PER_PAGE = 20
  MIN_PER_PAGE = 1
  MAX_PER_PAGE = 50

  def self.call(user:, page: nil, per_page: nil, tag: nil)
    new(user: user, page: page, per_page: per_page, tag: tag).call
  end

  def initialize(user:, page: nil, per_page: nil, tag: nil)
    @user = user
    @page = page
    @per_page = per_page
    @tag = tag
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

  attr_reader :user, :page, :per_page, :tag

  def feed_posts
    posts = Post.where(author_id: user.id)
                .or(Post.where(author_id: followed_author_ids))
    posts = filter_by_tag(posts) unless tag.nil?

    posts.includes(
      :tags,
      { image_attachment: :blob },
      author: { avatar_attachment: :blob }
    ).order(created_at: :desc, id: :desc)
  end

  def filter_by_tag(posts)
    normalized_tag = tag.to_s.strip.downcase
    raise InvalidTagError, INVALID_TAG_ERROR unless valid_tag?(normalized_tag)

    matching_post_ids = PostTag.joins(:tag)
                               .where(tags: { name: normalized_tag })
                               .select(:post_id)

    posts.where(id: matching_post_ids)
  end

  def valid_tag?(normalized_tag)
    normalized_tag.length <= Tag::MAXIMUM_NAME_LENGTH &&
      normalized_tag.match?(Tag::NAME_FORMAT)
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
    integer_param(per_page, DEFAULT_PER_PAGE).clamp(MIN_PER_PAGE, MAX_PER_PAGE)
  end

  def integer_param(value, fallback)
    return fallback if value.nil?

    value.to_i
  end
end
