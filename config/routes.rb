Rails.application.routes.draw do
  root 'static_pages#root'
  get 'up', to: 'health#show'

  namespace :api, defaults: { format: :json } do
    resources :users, only: [:create, :index, :show] do
      resource :follow, only: [:create, :destroy]
    end
    resource :account, only: [] do
      patch :avatar
      patch :email
      patch :password
    end
    resource :email_verification, only: [:create, :update]
    resource :password_reset, only: :create
    resource :session, only: [:create, :destroy]
    resources :posts, only: [:create, :index, :show, :update, :destroy] do
      resource :like, only: [:create, :destroy]
    end
  end
end
