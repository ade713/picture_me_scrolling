const POST_TAGS_KEY = 'post[tags][]';

const buildMediaPostFormData = ({
  body = '',
  file,
  postType,
  tags,
  title,
  url = ''
}) => {
  const formData = new FormData();
  formData.append('post[url]', url);
  formData.append('post[title]', title);
  formData.append('post[post_type]', postType);
  formData.append('post[body]', body);
  formData.append('post[image]', file);
  tags.forEach(tag => formData.append(POST_TAGS_KEY, tag));

  return formData;
};

export default buildMediaPostFormData;
