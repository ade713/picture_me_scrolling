import { values } from 'lodash';

export const selectPost = ({ posts }, postId) => {
  const post = posts[postId] || {};
  return post;
};

export const selectAllPosts = ({ posts }) => values(posts);

export const selectUsers = ({ users }) => values(users);
