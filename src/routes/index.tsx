import React from "react";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Dashboard from "../pages/protected/Dashboard";
import Profile from "../pages/protected/Profile";
import Home from "../pages/protected/Home";
import Users from "../pages/protected/Users";

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/profile", element: <Profile /> },
  { path: "/users", element: <Users /> },
];
