// frontend/src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Main Pages
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import Analytics from "../pages/analytics/Analytics";

// Project Pages
import Projects from "../pages/projects/Projects";
import ProjectDetail from "../pages/projects/ProjectDetail";

// Sprint Pages
import Sprints from "../pages/sprints/Sprints";
import SprintDetail from "../pages/sprints/SprintDetail";

// Ticket Pages
import Tickets from "../pages/tickets/Tickets";
import Kanban from "../pages/tickets/Kanban";
import TicketDetail from "../pages/tickets/TicketDetail";

// Components
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";



export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Analytics />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== PROJECT ROUTES ==================== */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Projects />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== SPRINT ROUTES ==================== */}
      <Route
        path="/sprints"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Sprints />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sprints/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SprintDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== TICKET ROUTES ==================== */}
      {/* ✅ Redirect /kanban to /projects since projectId is required */}
      <Route
        path="/kanban"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Navigate to="/projects" replace />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ✅ Kanban with projectId - this works */}
      <Route
        path="/kanban/:projectId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Kanban />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Tickets />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TicketDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================== CATCH-ALL ==================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
