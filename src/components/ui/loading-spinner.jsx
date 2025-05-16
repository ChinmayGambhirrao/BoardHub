export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}
      />
    </div>
  );
}

export function ProgressBar({ value, message, className = "" }) {
  return (
    <div className={`w-full ${className}`}>
      {message && (
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
