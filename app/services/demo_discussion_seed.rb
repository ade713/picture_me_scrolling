# Stable timestamps identify seed entries without overwriting edited bodies.
module DemoDiscussionSeed
  module_function

  SEED_TIME = Time.utc(2026, 10, 1, 12)
  COMMENT_COUNT = 23
  REPLY_COUNT = 17
  SAMPLE_BODIES = [
    'A short comment for checking author and body spacing.',
    "A comment with multiple lines.\n\nThe blank line should remain visible.",
    'Plain text, not markup: <strong>Hello!</strong> & welcome.',
    'Photography, café stops, and sunsets 📷 🌅',
    "Long-word wrapping: #{'photography' * 35}",
    'A longer paragraph for reviewing preview truncation and narrow layouts. ' * 8,
    'A' * Comment::MAXIMUM_BODY_LENGTH,
    'A useful reference: https://example.com/photography'
  ].freeze

  def run(guest:, authors:)
    discussion = authors.first.posts.find_by!(title: 'Demo feed text 01')
    single = authors.last.posts.find_by!(title: 'Demo feed quote 02')
    commenters = [guest, *authors]

    # Let Comment acquire author/post locks in its normal order for each write.
    parents = COMMENT_COUNT.times.map do |index|
      seed_comment(discussion, index, user: commenters[index % commenters.length],
                   body: SAMPLE_BODIES[index % SAMPLE_BODIES.length])
    end

    # Keep these examples near the top of the newest-first discussion.
    add_replies(parents.last, REPLY_COUNT, commenters)
    add_replies(parents[-2], 1, commenters)
    deleted_parent = parents[-3]
    unless deleted_parent.deleted?
      add_replies(deleted_parent, 2, commenters)
      CommentDeletion.new(comment: deleted_parent).call
    end

    seed_comment(single, 0, user: guest, body: 'One comment for the single-preview example.')

    puts "Demo discussion: /#/posts/#{discussion.id}"
    puts "Single-comment example: /#/posts/#{single.id}"
  end

  def add_replies(parent, count, authors)
    return if parent.deleted?

    count.times do |index|
      body = "Reply #{index + 1}: #{SAMPLE_BODIES[index % SAMPLE_BODIES.length]}"
      seed_comment(parent.post, COMMENT_COUNT + index,
                   parent: parent, user: authors[index % authors.length],
                   body: body.first(Comment::MAXIMUM_BODY_LENGTH))
    end
  end

  def seed_comment(post, index, parent: nil, **attributes)
    post.comments.find_or_create_by!(parent_id: parent&.id, created_at: SEED_TIME + index.minutes) do |comment|
      comment.assign_attributes(attributes.merge(parent: parent))
    end
  end
end
