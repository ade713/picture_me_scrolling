export const profileMessages = Object.freeze({
  loadError: 'Unable to load profile.',
  loading: 'Loading profile…',
  noPosts: 'No posts yet',
  notFound: 'User not found'
});

export const profileViews = Object.freeze({
  followers: 'followers',
  following: 'following',
  posts: 'posts'
});

export const profileViewLabels = Object.freeze({
  [profileViews.followers]: 'Followers',
  [profileViews.following]: 'Following',
  [profileViews.posts]: 'Posts'
});

export const profileViewFromParam = viewParam => (
  viewParam === profileViews.followers || viewParam === profileViews.following
    ? viewParam
    : profileViews.posts
);

const compactCountFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
  notation: 'compact'
});
const exactCountFormatter = new Intl.NumberFormat('en');

const pluralizedFollowers = count => count === 1 ? 'follower' : 'followers';

export const profileCountLabels = Object.freeze({
  compactFollowers: count => (
    `${compactCountFormatter.format(count)} ${pluralizedFollowers(count)}`
  ),
  compactFollowing: count => `${compactCountFormatter.format(count)} following`,
  exactFollowers: count => (
    `${exactCountFormatter.format(count)} ${pluralizedFollowers(count)}`
  ),
  exactFollowing: count => `${exactCountFormatter.format(count)} following`
});
