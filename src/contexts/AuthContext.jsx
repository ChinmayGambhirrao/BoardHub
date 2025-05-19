import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    console.log(
      "Initializing with saved token:",
      savedToken ? "exists" : "none"
    );
    return savedToken;
  });
  const [loading, setLoading] = useState(true);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
  });
  const navigate = useNavigate();
  const { showError } = useToast();

  useEffect(() => {
    if (token) {
      console.log("Token changed - saving to localStorage");
      console.log("Token format check:", {
        length: token.length,
        type: typeof token,
        firstChars: token.substring(0, 10) + "...",
      });
      localStorage.setItem("token", token);
    } else {
      console.log("Token cleared - removing from localStorage");
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      console.log("Token available - fetching user info");
      authAPI
        .getCurrentUser()
        .then((res) => {
          console.log("User info loaded successfully");
          setUser(res.data);
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setUser(null);
          setToken(null);
          showError("Session expired. Please login again.");
        })
        .finally(() => setLoading(false));
    } else {
      console.log("No token - not fetching user");
      setLoading(false);
    }
  }, [token, showError]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authAPI.login(credentials);
      setToken(res.data.token);
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

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      showError("Failed to logout. Please try again.");
    }
  };

  const loginWithGoogle = async () => {
    try {
      setSocialLoading((prev) => ({ ...prev, google: true }));
      await authAPI.loginWithGoogle();
    } catch (err) {
      console.error("Google login error:", err);
      showError("Failed to login with Google. Please try again.");
    } finally {
      setSocialLoading((prev) => ({ ...prev, google: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        login,
        register,
        logout,
        setUser,
        setToken,
        loginWithGoogle,
        socialLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
