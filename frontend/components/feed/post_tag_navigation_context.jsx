import React, { createContext, useContext } from 'react';

import { routes } from '../../config/routes';

const PostTagDestinationContext = createContext(routes.dashboardTag);

export const PostTagNavigationProvider = ({ children, destination }) => (
  <PostTagDestinationContext.Provider value={destination}>
    {children}
  </PostTagDestinationContext.Provider>
);

export const usePostTagDestination = () => useContext(PostTagDestinationContext);
