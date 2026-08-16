import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import PublicLayout from "./components/PublicLayout";
import { HomePage, AboutPage, DemoPage, ContactPage } from "./pages/Public/PublicPages";
import Dashboard from "./pages/Dashboard/Dashboard";
import Instructors from "./pages/Instructors/Instructors";
import Students from "./pages/Students/Students";
import TrainingSession from "./pages/TrainingSession/TrainingSession";
import Tariff from "./pages/Tariff/Tariff";
import Enquiries from "./pages/Enquiries/enquiries";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorAvailabilityDashboard from "./pages/Instructors/InstructorAvailabilityDashboard";
import FleetExpenses from "./pages/FleetExpenses/FleetExpenses";
import OutstandingFees from "./pages/OutstandingFees/outstandingFees";
import SuperAdmin from "./pages/SuperAdmin/SuperAdmin";
import Tutorials from "./pages/Tutorials/Tutorials";
import ExpenseReport from "./pages/FleetExpenses/ExpenseReport";
import IncomeReport from "./pages/IncomeReport/IncomeReport";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
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

      <Route
        path="/trainingsession"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <TrainingSession />
          </ProtectedRoute>
        }
      />

       <Route
        path="/fleetexpenses"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <FleetExpenses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/outstandingfees"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <OutstandingFees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expense-report"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ExpenseReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/income-report"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IncomeReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutorials"
        element={
          <ProtectedRoute allowedRoles={["admin", "instructor"]}>
            <Tutorials />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdmin />
          </ProtectedRoute>
        }
      />

        <Route
    path="/instructors/:instructorId/availability"
    element={<InstructorAvailabilityDashboard />}
  />


    </Routes>
  );
}
