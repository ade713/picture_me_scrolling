export const INVALID_LINK_URL_ERROR = 'Link URL must be a valid http or https URL';

export const validateLinkUrl = linkUrl => {
  try {
    const parsedUrl = new URL(linkUrl);

    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};
