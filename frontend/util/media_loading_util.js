export const imageLoadingProps = priorityMedia => {
  if (priorityMedia) {
    return {
      decoding: 'sync',
      fetchPriority: 'high',
      loading: 'eager'
    };
  }

  return {
    decoding: 'async',
    loading: 'lazy'
  };
};
