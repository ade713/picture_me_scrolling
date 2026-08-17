class UserPostsQuery
  include QueryPagination

  INVALID_TAG_ERROR = 'Tag filter is invalid'.freeze

  class InvalidTagError < StandardError; end

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
    paginate(user_posts)
  end

  private

  attr_reader :user, :page, :per_page, :tag

  def user_posts
    posts = Post.where(author_id: user.id)
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

end
