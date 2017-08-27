Rails.application.routes.draw do

  root 'static_pages#root'

  namespace :api, defaults: { format: :json } do
    resources :users, only: [:create, :index] do
      resources :follows, only: [:create, :index, :destroy]
    end
    resource :session, only: [:create, :destroy]
    resources :posts, only: [:create, :index, :show, :update, :destroy] do
      resource :like, only: [:create, :destroy]
    end
  end
end
