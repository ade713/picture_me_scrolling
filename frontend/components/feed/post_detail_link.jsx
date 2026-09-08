import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { routes } from '../../config/routes';

const PostDetailLink = ({ children, postId }) => {
  const location = useLocation();
  const destination = routes.postDetail(postId);

  if (!children) return null;
  if (location.pathname === destination) return children;

  return (
    <Link
      className="post-detail-link"
      to={destination}
      state={{ postOrigin: `${location.pathname}${location.search}` }}
    >
      {children}
    </Link>
  );
};

export default PostDetailLink;
