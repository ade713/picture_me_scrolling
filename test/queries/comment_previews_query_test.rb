require 'test_helper'

class CommentPreviewsQueryTest < ActiveSupport::TestCase
  test 'bounds each post to its latest three active parents and displays them chronologically' do
    timestamp = Time.current.change(usec: 0)
    comments = 4.times.map { create_comment(created_at: timestamp) }
    # A larger ID with an older timestamp must not displace a newer comment.
    create_comment(created_at: timestamp - 1.day)
    create_comment(parent: comments.last)
    Comment.create!(post: posts(:one), body: nil, user: nil, deleted_at: timestamp)
    other = create_comment(post: posts(:two))

    previews = CommentPreviewsQuery.call(post_ids: [posts(:one).id, posts(:two).id])

    assert_equal comments.last(3).map(&:id), previews.fetch(posts(:one).id).map(&:id)
    assert_equal [other.id], previews.fetch(posts(:two).id).map(&:id)
    assert_empty CommentPreviewsQuery.call(post_ids: [])
    assert_empty CommentPreviewsQuery.call(post_ids: [Post.maximum(:id) + 1])
  end

  test 'does not grow queries with additional posts or lazy author avatar reads' do
    authors = [users(:one), users(:two)]
    authors.each do |author|
      File.open(Rails.root.join('app/assets/images/profile_blue_150x150.png')) do |file|
        author.avatar.attach(io: file, filename: 'avatar.png', content_type: 'image/png')
      end
      assert author.avatar.attached?
    end
    create_comment
    create_comment(post: posts(:two), user: users(:two))

    single_count = query_count([posts(:one).id])
    collection_count = query_count([posts(:one).id, posts(:two).id])

    assert_operator single_count, :>, 0
    assert_equal single_count, collection_count
  ensure
    authors.each { |author| author.avatar.purge }
  end

  private

  def create_comment(**attributes)
    Comment.create!({ post: posts(:one), user: users(:one), body: 'Preview comment' }.merge(attributes))
  end

  def query_count(post_ids)
    count = 0
    subscriber = lambda do |_name, _start, _finish, _id, payload|
      count += 1 unless payload[:name] == 'SCHEMA' || payload[:cached]
    end
    ActiveSupport::Notifications.subscribed(subscriber, 'sql.active_record') do
      ActiveRecord::Base.uncached do
        CommentPreviewsQuery.call(post_ids: post_ids).values.flatten.each do |comment|
          comment.user.username
          comment.user.avatar.blob if comment.user.avatar.attached?
        end
      end
    end
    count
  end
end
