import { combineReducers } from 'redux';

import PostsReducer from './posts_reducer';
import SessionReducer from './session_reducer';
import ErrorsReducer from './errors_reducer';
import UsersReducer from './users_reducer';
import CommentsReducer from './comments_reducer';

const RootReducer = combineReducers({
  posts: PostsReducer,
  session: SessionReducer,
  users: UsersReducer,
  comments: CommentsReducer,
  errors: ErrorsReducer
});

export default RootReducer;
