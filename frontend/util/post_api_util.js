export const fetchAllPosts = () => {
  return $.ajax({
    method: 'GET',
    url: 'api/posts'
  });
};

export const fetchPost = id => {
  return $.ajax({
    method: 'GET',
    url: `api/posts/${id}`
  });
};

export const createPost = post => {
  return $.ajax({
    method: 'POST',
    url: 'api/posts',
    data: { post }
  });
};

export const createMediaPost = post => {
  return $.ajax({
    method: 'POST',
    url: 'api/posts',
    data: { post },
  });
};

export const updatePost = post => {
  return $.ajax({
    method: 'PATCH',
    url: `api/posts/${post.id}`,
    data: { post }
  });
};

export const deletePost = post => {
  return $.ajax({
    method: 'DELETE',
    url: `api/posts/${post.id}`
  });
};
