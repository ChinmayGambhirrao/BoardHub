import { BrowserRouter as Router } from "react-router-dom";
import { ErrorProvider } from "./contexts/ErrorContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
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
