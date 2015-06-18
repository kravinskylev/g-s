Rails.application.routes.draw do
  resources :apicombo

  root to:  "apicombo#index"
end
