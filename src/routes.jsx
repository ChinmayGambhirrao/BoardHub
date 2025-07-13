import { Routes, Route, Navigate } from "react-router-dom";
import Board from "./pages/Board";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Header from "./components/Header";
import { useAuth } from "./contexts/AuthContext";
import OAuthSuccess from "./pages/OAuthSuccess";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // or a loading spinner
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or a loading spinner

  return (
    <>
      {isAuthenticated && <Header />}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Landing />}
        />
        <Route
          path="/board/:id"
          element={
            <PrivateRoute>
              <Board />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </>
  );
}
