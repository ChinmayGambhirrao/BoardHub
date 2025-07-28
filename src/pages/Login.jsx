import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { FcGoogle } from "react-icons/fc";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, loginWithGoogle, loading, socialLoading } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      // Error is already handled in AuthContext
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      // Error is already handled in AuthContext
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-300">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border border-border transition-colors duration-300">
        <h1 className="text-3xl font-bold text-center text-foreground">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-muted-foreground bg-card">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={socialLoading.google}
            className="flex items-center justify-center w-full px-4 py-2 text-white bg-[#22272B] border border-gray-700 rounded-md hover:bg-[#2C3338] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            {socialLoading.google ? "Connecting..." : "Continue with Google"}
          </button>
        </div>

        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-400 focus:outline-none focus:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
