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

  def prepare_post_rendering_context(posts)
    post_ids = posts.map(&:id)
    author_ids = posts.map(&:author_id)

    @liked_post_ids = current_user.likes
                                  .where(post_id: post_ids)
                                  .pluck(:post_id)
    @followed_author_ids = current_user.followees
                                       .where(followee_id: author_ids)
                                       .pluck(:followee_id)
    @post_like_counts = Like.where(post_id: post_ids).group(:post_id).count
  end
end
