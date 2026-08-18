export const profileMessages = Object.freeze({
  loadError: 'Unable to load profile.',
  loading: 'Loading profile…',
  notFound: 'User not found'
});

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
