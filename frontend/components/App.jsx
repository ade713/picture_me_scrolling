import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Dashboard from "./dashboard/dashboard";
import AuthForm from "./auth_form/auth_form";
import EmailVerificationPage from "./email_verification/email_verification_page";
import SettingsPage from "./settings/settings_page";
import { routes } from "../config/routes";
import { AuthRoute, ProtectedRoute } from "../util/route_util";

const App = () => (
  <HashRouter>
    <Routes>
      <Route
        path={routes.dashboard}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.settings}
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={routes.verifyEmail}
        element={<EmailVerificationPage />}
      />
      <Route
        path={routes.signup}
        element={
          <AuthRoute>
            <AuthForm />
          </AuthRoute>
        }
      />
      <Route
        path={routes.home}
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
