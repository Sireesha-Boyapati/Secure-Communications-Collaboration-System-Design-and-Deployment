import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" aria-hidden />
        <p>Loading StudySafe…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/room/:roomId" element={<ChatPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
