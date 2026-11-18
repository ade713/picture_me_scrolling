import React from 'react';

// Only explicit HTTP(S) URLs at a text boundary are candidates. Bare domains,
// email addresses, and other schemes remain plain text.
const URL_PATTERN = /(^|[\s([{<"'])((?:https?):\/\/[^\s<>"']+)/gi;
const CLOSING_PAIRS = { ')': '(', ']': '[', '}': '{' };
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:]/;
const ALLOWED_PROTOCOLS = Object.freeze(['http:', 'https:']);

const trimTrailingPunctuation = candidate => {
  let url = candidate;
  while (url) {
    const last = url.at(-1);
    const opening = CLOSING_PAIRS[last];
    const unmatchedClosing = opening && (
      url.split(last).length > url.split(opening).length
    );
    if (!TRAILING_PUNCTUATION_PATTERN.test(last) && !unmatchedClosing) break;
    url = url.slice(0, -1);
  }
  return url;
};

const isHttpUrl = value => {
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
};

const CommentBody = ({ body }) => {
  const content = [];
  let position = 0;

  for (const match of body.matchAll(URL_PATTERN)) {
    const start = match.index + match[1].length;
    const url = trimTrailingPunctuation(match[2]);
    if (!isHttpUrl(url)) continue;

    content.push(body.slice(position, start));
    content.push(
      <a key={start} href={url} target="_blank" rel="noopener noreferrer ugc">
        {url}
      </a>
    );
    position = start + url.length;
  }
  content.push(body.slice(position));

  return <p className="comment-body">{content}</p>;
};

export default CommentBody;
