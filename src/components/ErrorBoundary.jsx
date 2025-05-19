import { Component } from "react";
import { useError } from "../contexts/ErrorContext";

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // TODO: Log to Sentry in production
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error);
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
          <h2 className="mb-4 text-xl font-semibold text-red-800 dark:text-red-200">
            Something went wrong
          </h2>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap the class component with a function component to use hooks
export function ErrorBoundary(props) {
  const { setError } = useError();

  return (
    <ErrorBoundaryClass
      {...props}
      onError={(error) => {
        setError("UNEXPECTED_ERROR", error.message);
      }}
    />
  );
}
