import React from "react";
import { createRoot } from "react-dom/client";

import Root from "./components/root";
import queryClient from "./query/query_client";
import { queryKeys } from "./query/query_keys";

document.addEventListener("DOMContentLoaded", () => {
  if (window.currentUser) {
    queryClient.setQueryData(queryKeys.currentUser, window.currentUser);
    delete window.currentUser;
  } else {
    queryClient.setQueryData(queryKeys.currentUser, null);
  }

  const root = document.getElementById("root");
  createRoot(root).render(<Root />);
});
