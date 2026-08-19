import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { normalizeTag } from '../../config/tags';
import { profileViewFromParam, profileViews } from '../../config/user_profile';

const normalizedTagFrom = tagParam => {
  if (!tagParam) return undefined;

  return normalizeTag(tagParam) || undefined;
};

const useProfileNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTag = searchParams.get('tag');
  const activeTag = normalizedTagFrom(requestedTag);
  const activeView = profileViewFromParam(searchParams.get('view'));

  useEffect(() => {
    const normalizedParams = new URLSearchParams(searchParams);

    if (activeView === profileViews.posts) {
      normalizedParams.delete('view');

      if (activeTag) {
        normalizedParams.set('tag', activeTag);
      } else {
        normalizedParams.delete('tag');
      }
    } else {
      normalizedParams.delete('tag');
    }

    if (normalizedParams.toString() !== searchParams.toString()) {
      setSearchParams(normalizedParams, { replace: true });
    }
  }, [activeTag, activeView, searchParams, setSearchParams]);

  return { activeTag, activeView };
};

export default useProfileNavigation;
