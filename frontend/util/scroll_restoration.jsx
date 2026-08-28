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
  const scrollPositions = useRef({
    historyEntries: new Map(),
    routes: new Map()
  });

  return (
    <ScrollRestorationContext.Provider value={scrollPositions}>
      {children}
    </ScrollRestorationContext.Provider>
  );
};

export const useScrollRestoration = ({
  getScrollPosition = getWindowScrollPosition,
  restoreByRoute = false,
  restoreScrollPosition = restoreWindowScrollPosition
} = {}) => {
  const localScrollPositions = useRef({
    historyEntries: new Map(),
    routes: new Map()
  });
  const sharedScrollPositions = useContext(ScrollRestorationContext);
  const scrollPositions = sharedScrollPositions || localScrollPositions;
  const location = useLocation();
  const navigationType = useNavigationType();
  const routeKey = `${location.pathname}${location.search}`;
  const routePosition = restoreByRoute
    ? scrollPositions.current.routes.get(routeKey)
    : undefined;
  const historyPosition = navigationType === 'POP'
    ? scrollPositions.current.historyEntries.get(location.key)
    : undefined;
  const savedPosition = routePosition ?? historyPosition;

  useLayoutEffect(() => {
    if (savedPosition !== undefined) {
      restoreScrollPosition(savedPosition);
    }

    return () => {
      const position = getScrollPosition();

      scrollPositions.current.historyEntries.set(location.key, position);
      scrollPositions.current.routes.set(routeKey, position);
    };
  }, [
    getScrollPosition,
    location.key,
    restoreByRoute,
    restoreScrollPosition,
    routeKey,
    savedPosition,
    scrollPositions
  ]);

  return savedPosition === undefined;
};
