import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CitizenDashboard from '../pages/CitizenDashboard';
import CreateReport from '../pages/CreateReport';
import ReportDetail from '../pages/ReportDetail';
import MapViewPage from '../pages/MapViewPage';
import ClustersPage from '../pages/ClustersPage';
import AdminDashboard from '../pages/AdminDashboard';
import DepartmentDashboard from '../pages/DepartmentDashboard';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <MapViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clusters"
        element={
          <ProtectedRoute>
            <ClustersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/reports/:id" element={<ReportDetail />} />
      <Route path="/report-detail/:id" element={<ReportDetail />} />

      {/* Citizen Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen-dashboard"
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
            <CreateReport />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Department Officer Protected Routes */}
      <Route
        path="/department"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DEPARTMENT_OFFICER']}>
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />

      {/* User Common Protected Routes */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
