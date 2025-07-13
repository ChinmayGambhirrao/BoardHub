import { BrowserRouter as Router } from "react-router-dom";
import { ErrorProvider } from "./contexts/ErrorContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import "./index.css";

function App() {
  // Add viewport meta tag for mobile devices
  useEffect(() => {
    // Ensure proper mobile viewport settings
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
      document.head.appendChild(meta);
    } else {
      viewport.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
    }

    // Add touch-action meta to prevent default touch behaviors
    const touchAction = document.querySelector('meta[name="touch-action"]');
    if (!touchAction) {
      const meta = document.createElement("meta");
      meta.name = "touch-action";
      meta.content = "manipulation";
      document.head.appendChild(meta);
    }

    // Add mobile web app capability
    const appleMobileWebApp = document.querySelector(
      'meta[name="apple-mobile-web-app-capable"]'
    );
    if (!appleMobileWebApp) {
      const meta = document.createElement("meta");
      meta.name = "apple-mobile-web-app-capable";
      meta.content = "yes";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <ErrorProvider>
      <LoadingProvider>
        <ToastProvider>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-background text-foreground">
                <AppRoutes />
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </LoadingProvider>
    </ErrorProvider>
  );
}

export default App;
