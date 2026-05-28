import React from "react";
import { createRoot } from "react-dom/client";

import Root from "./components/root";
import queryClient from "./query/query_client";
import { queryKeys } from "./query/query_keys";
import configureStore from "./store/store";

document.addEventListener("DOMContentLoaded", () => {
  let store;
  if (window.currentUser) {
    queryClient.setQueryData(queryKeys.currentUser, window.currentUser);

    const preloadedState = {
      session: {
        currentUser: window.currentUser,
      },
    };
    store = configureStore(preloadedState);
    delete window.currentUser;
  } else {
    queryClient.setQueryData(queryKeys.currentUser, null);
    store = configureStore();
  }

  window.getState = store.getState;
  window.dispatch = store.dispatch;

  const root = document.getElementById("root");
  createRoot(root).render(<Root store={store} />);
});
