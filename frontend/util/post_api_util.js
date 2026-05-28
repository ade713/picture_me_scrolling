import { csrfHeaders } from './csrf_api_util';
import { destroy, post } from './api_client';

export const fetchAllPosts = () => {
  return $.ajax({
    method: 'GET',
    url: '/api/posts',
    dataType: 'json'
  });
};

export const fetchPost = id => {
  return $.ajax({
    method: 'GET',
    url: `/api/posts/${id}`,
    dataType: 'json'
  });
};

export const createPost = post => {
  return $.ajax({
    method: 'POST',
    url: '/api/posts',
    dataType: 'json',
    headers: csrfHeaders(),
    data: { post }
  });
};

export const createMediaPost = formData => {
  return $.ajax({
    method: 'POST',
    url: '/api/posts',
    dataType: 'json',
    headers: csrfHeaders(),
    contentType: false,
    processData: false,
    data: formData
  });
};

export const updatePost = post => {
  return $.ajax({
    method: 'PATCH',
    url: `/api/posts/${post.id}`,
    dataType: 'json',
    headers: csrfHeaders(),
    data: { post }
  });
};

export const deletePost = post => {
  return $.ajax({
    method: 'DELETE',
    url: `/api/posts/${post.id}`,
    dataType: 'json',
    headers: csrfHeaders()
  });
};

export const createLike = id => (
  post(`/api/posts/${id}/like`)
);

export const deleteLike = id => (
  destroy(`/api/posts/${id}/like`)
);
