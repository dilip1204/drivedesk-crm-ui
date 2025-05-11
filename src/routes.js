// src/routes.js - React Router Configuration
import React from "react";
import {Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login/Login';
import Dashboard from "./pages/Dashboard/Dashboard";
import Instructors from "./pages/Instructors/Instructors";
import Students from "./pages/Students/Students";



export default function AppRoutes() {
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />  {/* Redirect to Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/students" element={<Students />} />

        
      </Routes>
    
  );
}