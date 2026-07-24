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
