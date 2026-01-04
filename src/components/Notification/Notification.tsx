import { useState } from "react";
import type { Notification as NotificationType } from "../../contexts/NotificationContext";
import { useNotifications } from "../../contexts/NotificationContext";

interface NotificationProps {
  notification: NotificationType;
}

export default function Notification({ notification }: NotificationProps) {
  const { removeNotification } = useNotifications();
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "uploading":
        return (
          <svg
            className="w-5 h-5 text-blue-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        );
      case "processing":
        return (
          <svg
            className="w-5 h-5 text-purple-600 animate-spin"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "uploading":
        return "bg-blue-50 border-blue-200";
      case "processing":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "uploading":
        return "text-blue-800";
      case "processing":
        return "text-purple-800";
      default:
        return "text-blue-800";
    }
  };

  const getMessageColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-700";
      case "error":
        return "text-red-700";
      case "uploading":
        return "text-blue-700";
      case "processing":
        return "text-purple-700";
      default:
        return "text-blue-700";
    }
  };

  const getProgressBarColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-500";
      case "uploading":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`${getBgColor()} border rounded-lg shadow-lg mb-3 min-w-[320px] max-w-md animate-slide-in overflow-hidden`}
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${getTitleColor()}`}>
              {notification.title}
            </p>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {notification.message && (
            <p className={`text-sm mt-1 ${getMessageColor()}`}>
              {notification.message}
            </p>
          )}

          {notification.error && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                {isExpanded ? "Hide details" : "Show details"}
                <svg
                  className={`w-3 h-3 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800 font-mono">
                  {notification.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Auto-close countdown progress bar */}
      {notification.autoClose && notification.duration && (
        <div className="h-1 w-full bg-black/10">
          <div
            className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
            style={{
              width: "100%",
              animation: `shrink ${notification.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
