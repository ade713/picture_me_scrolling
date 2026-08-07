class PostWriter
  MAXIMUM_TAGS = 5
  MAXIMUM_TAGS_ERROR = "Posts can have up to #{MAXIMUM_TAGS} tags".freeze

  Result = Struct.new(:post, :errors, keyword_init: true) do
    def success?
      errors.empty?
    end
  end

  def initialize(post:, attributes:, tag_names: nil)
    @post = post
    @attributes = attributes
    @tag_names = tag_names
  end

  def call
    post.assign_attributes(attributes)
    normalized_tag_names = normalize_tag_names
    validation_errors = tag_count_errors(normalized_tag_names)
    return failure(validation_errors) if validation_errors.any?

    Post.transaction do
      post.save!
      replace_tags(normalized_tag_names) unless tag_names.nil?
    end

    Result.new(post: post, errors: [])
  rescue ActiveRecord::RecordInvalid => error
    failure(error.record.errors.full_messages)
  end

  private

  attr_reader :post, :attributes, :tag_names

  def normalize_tag_names
    return [] if tag_names.nil?

    tag_names.map { |name| Tag.normalize_value_for(:name, name) }.uniq
  end

  def tag_count_errors(normalized_tag_names)
    return [] if normalized_tag_names.length <= MAXIMUM_TAGS

    [MAXIMUM_TAGS_ERROR]
  end

  def replace_tags(normalized_tag_names)
    tags = normalized_tag_names.map { |name| Tag.find_or_create_by!(name: name) }
    post.tags = tags
  end

  def failure(errors)
    Result.new(post: post, errors: errors)
  end
end
