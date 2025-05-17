import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    github: false,
  });
  const navigate = useNavigate();
  const { showError } = useToast();

  useEffect(() => {
    if (token) {
      // Optionally, fetch user info from backend
      authAPI
        .getCurrentUser()
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          showError("Session expired. Please login again.");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, showError]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authAPI.login(credentials);
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res;
    } catch (err) {
      console.error("Login error:", err);
      showError(
        err.response?.data?.message || "Login failed. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authAPI.register(userData);
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return res;
    } catch (err) {
      console.error("Registration error:", err);
      showError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setSocialLoading((prev) => ({ ...prev, google: true }));
      await authAPI.loginWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);
      showError("Google login failed. Please try again.");
    } finally {
      setSocialLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const loginWithGithub = async () => {
    try {
      setSocialLoading((prev) => ({ ...prev, github: true }));
      await authAPI.loginWithGithub();
    } catch (err) {
      console.error("GitHub login error:", err);
      showError("GitHub login failed. Please try again.");
    } finally {
      setSocialLoading((prev) => ({ ...prev, github: false }));
    }
  };

  const logout = () => {
    try {
      authAPI.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      showError("Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        socialLoading,
        login,
        register,
        loginWithGoogle,
        loginWithGithub,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
