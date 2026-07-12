import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FullPageLoader } from "./components/ui";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import InterviewPrep from "./pages/InterviewPrep";
import Profile from "./pages/Profile";
import RoleManagement from "./pages/admin/RoleManagement";
import UserManagement from "./pages/admin/UserManagement";
import PermissionManagement from "./pages/admin/PermissionManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AnswerEvaluator from "./pages/AnswerEvaluator";
import MockInterview from "./pages/MockInterview";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * `/` shows Landing for guests, Dashboard for logged-in users.
 */
function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullPageLoader message="Loading..." />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-white">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-prep"
              element={
                <ProtectedRoute>
                  <InterviewPrep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            // AI Features
            <Route
              path="/resume-analyzer"
              element={
                <ProtectedRoute>
                  <ResumeAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/answer-evaluator"
              element={
                <ProtectedRoute>
                  <AnswerEvaluator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ProtectedRoute>
                  <MockInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            // Admin Routes
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  {/* Admin layout - could be expanded later */}
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <AdminDashboard />
                }
              />
              <Route
                path="users"
                element={
                  <UserManagement />
                }
              />
              <Route
                path="permissions"
                element={
                  <PermissionManagement />
                }
              />
              <Route
                path="roles"
                element={
                  <RoleManagement />
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;