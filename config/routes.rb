Rails.application.routes.draw do
  root 'static_pages#root'
  get 'up', to: 'health#show'

  namespace :api, defaults: { format: :json } do
    resources :users, only: [:create, :index, :show] do
      resource :follow, only: [:create, :destroy]
      resources :followers, only: [:index], controller: 'user_followers'
      resources :posts, only: [:index], controller: 'user_posts'
    end
    get 'users/:user_id/following',
        to: 'user_following#index',
        as: :user_following
    resource :account, only: [] do
      patch :avatar
      patch :email
      patch :password
    end
    resource :email_verification, only: [:create, :update]
    resource :password_reset, only: [:create, :update]
    resource :session, only: [:create, :destroy]
    resources :posts, only: [:create, :index, :show, :update, :destroy] do
      resource :like, only: [:create, :destroy]
    end
  end
end
