"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          onClose(toast.id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [toast.id, onClose, duration]);

  const bgColor = {
    success: "bg-green-600/50 border-green-400/40",
    error: "bg-red-600/50 border-red-400/40",
    info: "bg-blue-600/50 border-blue-400/40",
  }[toast.type];

  const progressColor = {
    success: "bg-green-400",
    error: "bg-red-400",
    info: "bg-blue-400",
  }[toast.type];

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[toast.type];

  return (
    <div
      className={`relative overflow-hidden rounded-lg border backdrop-blur-sm ${bgColor} shadow-lg mb-3 animate-in slide-in-from-right duration-300`}
      style={{ minWidth: "280px", maxWidth: "380px" }}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className="shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight">{toast.title}</h3>
          {toast.message && (
            <p className="text-white/80 text-xs mt-1 leading-snug wrap-break-word whitespace-pre-line">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="shrink-0 text-white/70 hover:text-white transition-colors -mt-0.5"
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
      {/* Progress Bar */}
      <div className="h-0.5 bg-black/20">
        <div
          className={`h-full transition-all duration-100 ease-linear ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastsState: Toast[] = [];

function notifyListeners() {
  // Schedule the state update to avoid calling setState during render
  if (typeof window !== 'undefined') {
    queueMicrotask(() => {
      toastListeners.forEach((listener) => listener([...toastsState]));
    });
  }
}

export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    toastsState.push({ id, type: "success", title, message, duration });
    notifyListeners();
  },
  error: (title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    toastsState.push({ id, type: "error", title, message, duration });
    notifyListeners();
  },
  info: (title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    toastsState.push({ id, type: "info", title, message, duration });
    notifyListeners();
  },
  remove: (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-16 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={toast.remove} />
        ))}
      </div>
    </div>,
    document.body
  );
}
