import React from "react";
import Login from "../pages/public/Login";
import Dashboard from "../pages/protected/Dashboard";

export const routes = [
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  // ajouter routes protégées et rôles ici
];
