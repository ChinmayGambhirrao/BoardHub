import { createContext, useContext, useState, useCallback } from "react";

// Error types
export const ErrorType = {
  NETWORK_ERROR: "NETWORK_ERROR",
  DATA_LOADING_ERROR: "DATA_LOADING_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  FORM_SUBMISSION_ERROR: "FORM_SUBMISSION_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
};

// Error configurations
const ERROR_CONFIGS = {
  [ErrorType.NETWORK_ERROR]: {
    shouldRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  [ErrorType.DATA_LOADING_ERROR]: {
    shouldRetry: true,
    maxRetries: 2,
    retryDelay: 1000,
  },
  [ErrorType.PERMISSION_ERROR]: {
    shouldRetry: false,
    maxRetries: 0,
    retryDelay: 0,
  },
  [ErrorType.FORM_SUBMISSION_ERROR]: {
    shouldRetry: false,
    maxRetries: 0,
    retryDelay: 0,
  },
  [ErrorType.UNEXPECTED_ERROR]: {
    shouldRetry: false,
    maxRetries: 0,
    retryDelay: 0,
  },
};

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setErrorState] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const setError = useCallback(
    (type, message, retryCallback = null) => {
      const config = ERROR_CONFIGS[type];

      if (
        config.shouldRetry &&
        retryCallback &&
        retryCount < config.maxRetries
      ) {
        // Implement exponential backoff
        const delay = config.retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          retryCallback();
          setRetryCount((prev) => prev + 1);
        }, delay);
      } else {
        setErrorState({ type, message });
        setRetryCount(0);
      }
    },
    [retryCount]
  );

  const clearError = useCallback(() => {
    setErrorState(null);
    setRetryCount(0);
  }, []);

  const value = {
    error,
    setError,
    clearError,
    retryCount,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
