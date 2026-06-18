class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  helper_method :current_user, :logged_in?

  def login(user)
    @current_user = user
    session[:session_token] = @current_user.reset_session_token!
  end

  def logout
    current_user.reset_session_token!
    session[:session_token] = nil
  end

  def current_user
    return nil unless session[:session_token]
    @current_user ||= User.find_by_session_token(session[:session_token])
  end

  def logged_in?
    !!current_user
  end

  def require_logged_in
    render json: ['You must be logged in'], status: :unauthorized unless logged_in?
  end

  private

  def paginated_feed_for(user)
    posts = sorted_feed_posts_for(user)
    pagination = feed_pagination(posts.count)

    [
      posts.slice(pagination[:offset], pagination[:per_page]) || [],
      pagination
    ]
  end

  def sorted_feed_posts_for(user)
    (user.posts + user.followed_posts)
      .uniq
      .sort_by(&:created_at)
      .reverse
  end

  def feed_pagination(total_count)
    page = [params.fetch(:page, 1).to_i, 1].max
    per_page = params.fetch(:per_page, 20).to_i.clamp(1, 50)
    total_pages = (total_count.to_f / per_page).ceil

    {
      has_more: page < total_pages,
      offset: (page - 1) * per_page,
      page: page,
      per_page: per_page,
      total_count: total_count,
      total_pages: total_pages
    }
  end
end
