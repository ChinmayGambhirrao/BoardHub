import { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loadingStates, setLoadingStates] = useState({});
  const [progress, setProgress] = useState({
    isVisible: false,
    value: 0,
    message: "",
  });

  const setComponentLoading = useCallback(
    (componentId, isLoading, message = "") => {
      setLoadingStates((prev) => ({
        ...prev,
        [componentId]: { isLoading, message },
      }));
    },
    []
  );

  const setComponentSaving = useCallback(
    (componentId, isSaving, message = "") => {
      setLoadingStates((prev) => ({
        ...prev,
        [componentId]: { ...prev[componentId], isSaving, message },
      }));
    },
    []
  );

  const setProgressState = useCallback((isVisible, value = 0, message = "") => {
    setProgress({ isVisible, value, message });
  }, []);

  const getComponentState = useCallback(
    (componentId) => {
      return (
        loadingStates[componentId] || {
          isLoading: false,
          isSaving: false,
          message: "",
        }
      );
    },
    [loadingStates]
  );

  const value = {
    setComponentLoading,
    setComponentSaving,
    setProgressState,
    getComponentState,
    progress,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
