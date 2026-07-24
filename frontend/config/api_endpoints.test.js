import { apiEndpoints } from './api_endpoints';

describe('apiEndpoints', () => {
  it('defines account and session endpoints', () => {
    expect(apiEndpoints.account.avatar).toBe('/api/account/avatar');
    expect(apiEndpoints.account.password).toBe('/api/account/password');
    expect(apiEndpoints.session).toBe('/api/session');
  });

  it('builds post endpoints', () => {
    expect(apiEndpoints.posts.collection).toBe('/api/posts');
    expect(apiEndpoints.posts.detail(12)).toBe('/api/posts/12');
    expect(apiEndpoints.posts.feed({ page: 2, perPage: 10 })).toBe(
      '/api/posts?page=2&per_page=10'
    );
    expect(apiEndpoints.posts.like(12)).toBe('/api/posts/12/like');
  });

  it('builds user endpoints', () => {
    expect(apiEndpoints.users.collection).toBe('/api/users');
    expect(apiEndpoints.users.detail(7)).toBe('/api/users/7');
    expect(apiEndpoints.users.follow(7)).toBe('/api/users/7/follow');
  });
});
