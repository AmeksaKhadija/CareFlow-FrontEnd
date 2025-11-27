import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";

export default function App() {
  return (
    <Routes>
      {routes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
