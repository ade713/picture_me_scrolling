import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Dashboard from "./dashboard/dashboard";
import AuthForm from "./auth_form/auth_form";
import SettingsPage from "./settings/settings_page";
import { AuthRoute, ProtectedRoute } from "../util/route_util";

const App = () => (
  <HashRouter>
    <Routes>
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/settings'
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/signup'
        element={
          <AuthRoute>
            <AuthForm />
          </AuthRoute>
        }
      />
      <Route
        path='/'
        element={
          <AuthRoute>
            <AuthForm />
          </AuthRoute>
        }
      />
    </Routes>
  </HashRouter>
);

export default App;
