export const postTypes = Object.freeze({
  audio: 'audio',
  link: 'link',
  photo: 'photo',
  quote: 'quote',
  text: 'text',
  video: 'video'
});

export const mediaPostTypes = Object.freeze([
  postTypes.audio,
  postTypes.photo,
  postTypes.video
]);

export const postTypeLabels = Object.freeze({
  [postTypes.audio]: 'Audio',
  [postTypes.link]: 'Link',
  [postTypes.photo]: 'Photo',
  [postTypes.quote]: 'Quote',
  [postTypes.text]: 'Text',
  [postTypes.video]: 'Video'
});
