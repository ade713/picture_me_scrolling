import { combineReducers } from 'redux';

import PostsReducer from './posts_reducer';
import SessionReducer from './session_reducer';
import ErrorsReducer from './errors_reducer';
import UsersReducer from './users_reducer';

const RootReducer = combineReducers({
  posts: PostsReducer,
  session: SessionReducer,
  users: UsersReducer,
  errors: ErrorsReducer
});

export default RootReducer;
