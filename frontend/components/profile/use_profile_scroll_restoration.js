import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const useProfileScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef(new Map());
  const savedPosition = navigationType === 'POP'
    ? scrollPositions.current.get(location.key)
    : undefined;

  useLayoutEffect(() => {
    if (savedPosition !== undefined) {
      window.scrollTo({
        behavior: 'auto',
        left: 0,
        top: savedPosition
      });
    }

    return () => {
      scrollPositions.current.set(location.key, window.scrollY);
    };
  }, [location.key, savedPosition]);

  return savedPosition === undefined;
};

export default useProfileScrollRestoration;
