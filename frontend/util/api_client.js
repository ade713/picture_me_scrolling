import { csrfHeaders } from './csrf_api_util';

export class ApiError extends Error {
  constructor(message, { status, response, data, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.data = data;
    this.errors = errors || [message];
  }
}

const isFormData = body => (
  typeof FormData !== 'undefined' && body instanceof FormData
);

const parseResponse = async response => {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const extractErrors = data => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.errors)) return data.errors;
  if (data && data.error) return [data.error];
  if (typeof data === 'string') return [data];
  return null;
};

export const request = async (url, options = {}) => {
  const {
    body,
    headers = {},
    method = 'GET',
    ...fetchOptions
  } = options;

  const formDataBody = isFormData(body);
  const requestHeaders = {
    Accept: 'application/json',
    ...csrfHeaders(),
    ...headers
  };

  let requestBody = body;

  if (body !== undefined && !formDataBody) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: requestHeaders,
    body: requestBody,
    ...fetchOptions
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const errors = extractErrors(data);
    const message = errors ? errors.join(', ') : response.statusText;

    throw new ApiError(message, {
      status: response.status,
      response,
      data,
      errors
    });
  }

  return data;
};

export const get = (url, options = {}) => (
  request(url, { ...options, method: 'GET' })
);

export const post = (url, body, options = {}) => (
  request(url, { ...options, method: 'POST', body })
);

export const patch = (url, body, options = {}) => (
  request(url, { ...options, method: 'PATCH', body })
);

export const destroy = (url, options = {}) => (
  request(url, { ...options, method: 'DELETE' })
);
