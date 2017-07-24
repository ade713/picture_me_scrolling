import { combineReducers } from 'redux';

import PostsReducer from './posts_reducer';
import SessionReducer from './session_reducer';
import ErrorsReducer from './errors_reducer';

const RootReducer = combineReducers({
  posts: PostsReducer,
  session: SessionReducer,
  errors: ErrorsReducer
});

export default RootReducer;
