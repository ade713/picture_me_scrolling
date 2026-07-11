module ApplicationHelper
  def avatar_url_for(user)
    return url_for(user.avatar) if user.avatar.attached?

    asset_path(User::DEFAULT_AVATAR_IMAGE)
  end
end
