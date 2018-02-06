Rails.application.routes.draw do

  root 'static_pages#root'

  namespace :api, defaults: { format: :json } do
    resources :users, only: [:create, :index] do
      resource :follow, only: [:create, :destroy]
    end
    resource :session, only: [:create, :destroy]
    resources :posts, only: [:create, :index, :show, :update, :destroy] do
      resources :comments, only: [:create, :index, :update, :destroy]
      resource :like, only: [:create, :destroy]
    end
  end
end
