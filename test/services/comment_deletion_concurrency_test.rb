require 'test_helper'
require 'timeout'

class CommentDeletionConcurrencyTest < ActiveSupport::TestCase
  self.use_transactional_tests = false
  THREAD_TIMEOUT_SECONDS = 5

  setup do
    @author = User.create!(username: "comment-race-#{SecureRandom.hex(6)}", password: 'password')
    @post = Post.create!(author: @author, title: 'Discussion race', post_type: Post::TYPES[:text])
    @parent = Comment.create!(post: @post, user: @author, body: 'Parent')
  end

  teardown do
    @post&.delete
    @author&.destroy!
  end

  test 'simultaneous final reply deletions remove the placeholder' do
    replies = 2.times.map do
      Comment.create!(post: @post, user: @author, parent: @parent, body: 'Reply')
    end
    CommentDeletion.new(comment: @parent).call

    concurrently(*replies.map(&:id)) do |id|
      CommentDeletion.new(comment: Comment.find(id)).call
    end

    assert_empty Comment.where(post_id: @post.id)
  end

  test 'reply creation racing with parent deletion cannot leave an orphan or reply to a deleted parent' do
    # Either the reply commits first and is preserved beneath a placeholder,
    # or deletion wins and the reply is rejected. Both outcomes are valid.
    outcomes = concurrently(:create, :delete) do |operation|
      if operation == :delete
        CommentDeletion.new(comment: Comment.find(@parent.id)).call
        :deleted
      else
        reply = Comment.new(post_id: @post.id, user_id: @author.id,
                            parent_id: @parent.id, body: 'Racing reply')
        reply.save ? :created : :rejected
      end
    end

    if outcomes.include?(:created)
      assert @parent.reload.deleted?
      assert_nil @parent.body
      assert_nil @parent.user_id
      assert_equal 1, @parent.replies.count
    else
      assert_includes outcomes, :rejected
      assert_empty Comment.where(post_id: @post.id)
    end
  end

  private

  def concurrently(*operations)
    # Workers announce readiness, then wait for the main test to release them.
    ready = Queue.new
    start = Queue.new
    threads = operations.map do |operation|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          ready << true
          start.pop
          yield operation
        end
      end
    end

    Timeout.timeout(THREAD_TIMEOUT_SECONDS) do
      operations.length.times { ready.pop }
      operations.length.times { start << true }
      threads.map(&:value)
    end
  ensure
    # Stop unfinished workers on failure or timeout, then wait for cleanup.
    threads&.each { |thread| thread.kill if thread.alive? }
    threads&.each(&:join)
  end
end
