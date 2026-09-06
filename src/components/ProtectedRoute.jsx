// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("userRoleInfo") || "{}");
  } catch {
    user = {};
  }
  const role = String(user?.role || "").trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((allowedRole) =>
    String(allowedRole).trim().toLowerCase()
  );

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(role)) {
    const fallbackPath = role === "super_admin" ? "/superadmin" : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
