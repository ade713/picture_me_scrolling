if @posts.empty?
  json.posts({})
else
  json.posts do
    @posts.each do |post|
      json.set! post.id do
        json.partial! 'api/posts/post', post: post
      end
    end
  end
end

json.post_ids @posts.map(&:id)

json.pagination do
  json.extract! @pagination, :page, :per_page, :total_count, :total_pages, :has_more
end
