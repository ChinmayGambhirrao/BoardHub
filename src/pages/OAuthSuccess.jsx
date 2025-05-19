import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [status, setStatus] = useState("Processing login...");
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const processOAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const provider = params.get("provider");
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          console.error("OAuth Error:", error);
          setStatus("Authentication failed");
          showError(`Authentication failed: ${error}`);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (!provider || !code) {
          console.error("Missing OAuth data:", { provider, code });
          setStatus("Invalid authentication data");
          showError(
            "Invalid authentication data. Please try logging in again."
          );
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        setStatus(`Authenticating with ${provider}...`);

        // Get API URL from environment variable or use default
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

        // Exchange the code for a token
        const response = await axios.post(
          `${apiUrl}/api/auth/${provider}`,
          { code },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.token) {
          // Store token and user data
          localStorage.setItem("token", response.data.token);
          setToken(response.data.token);
          setUser(response.data.user);

          setStatus("Login successful! Redirecting...");
          setTimeout(() => navigate("/"), 1000);
        } else {
          throw new Error("No token received from server");
        }
      } catch (error) {
        console.error("OAuth processing error:", error);
        setStatus("Authentication failed");
        showError(
          error.response?.data?.message ||
            "Authentication failed. Please try again."
        );
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    processOAuth();
  }, [navigate, showError, setToken, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1D2125] text-white">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <div className="text-lg font-semibold">{status}</div>
      </div>
    </div>
  );
}
