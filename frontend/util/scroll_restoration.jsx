import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef
} from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollRestorationContext = createContext(null);

const getWindowScrollPosition = () => window.scrollY;

const restoreWindowScrollPosition = position => {
  window.scrollTo({
    behavior: 'auto',
    left: 0,
    top: position
  });
};

export const ScrollRestorationProvider = ({ children }) => {
  const scrollPositions = useRef(new Map());

  return (
    <ScrollRestorationContext.Provider value={scrollPositions}>
      {children}
    </ScrollRestorationContext.Provider>
  );
};

export const useScrollRestoration = ({
  getScrollPosition = getWindowScrollPosition,
  restoreScrollPosition = restoreWindowScrollPosition
} = {}) => {
  const localScrollPositions = useRef(new Map());
  const sharedScrollPositions = useContext(ScrollRestorationContext);
  const scrollPositions = sharedScrollPositions || localScrollPositions;
  const location = useLocation();
  const navigationType = useNavigationType();
  const savedPosition = navigationType === 'POP'
    ? scrollPositions.current.get(location.key)
    : undefined;

  useLayoutEffect(() => {
    if (savedPosition !== undefined) {
      restoreScrollPosition(savedPosition);
    }

    return () => {
      scrollPositions.current.set(location.key, getScrollPosition());
    };
  }, [
    getScrollPosition,
    location.key,
    restoreScrollPosition,
    savedPosition,
    scrollPositions
  ]);

  return savedPosition === undefined;
};
