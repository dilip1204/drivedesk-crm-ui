import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Instructors from "./pages/Instructors/Instructors";
import Students from "./pages/Students/Students";
import Tariff from "./pages/Tariff/Tariff";
import Enquiries from "./pages/Enquiries/enquiries";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructors"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <Instructors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <Students />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tariff"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Tariff />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enquiries"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <Enquiries />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
