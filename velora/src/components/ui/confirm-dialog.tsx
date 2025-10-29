"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const variantStyles = {
    danger: {
      icon: (
        <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      confirmBg: "bg-red-600 hover:bg-red-700",
      iconBg: "bg-red-500/20",
    },
    warning: {
      icon: (
        <svg className="w-12 h-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      confirmBg: "bg-yellow-600 hover:bg-yellow-700",
      iconBg: "bg-yellow-500/20",
    },
    info: {
      icon: (
        <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
      confirmBg: "bg-purple-600 hover:bg-purple-700",
      iconBg: "bg-purple-500/20",
    },
  };

  const style = variantStyles[variant];

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className="bg-neutral-900/95 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 border border-neutral-700/50">
          {/* Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className={`rounded-full p-3 ${style.iconBg}`}>
              {style.icon}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              {title}
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 font-semibold transition-all duration-200 border border-neutral-700/50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg ${style.confirmBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Hook untuk menggunakan confirm dialog
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm?: () => void;
  }>({
    open: false,
    title: "",
    message: "",
  });

  const confirm = ({
    title,
    message,
    confirmText,
    cancelText,
    variant = "danger",
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, open: false }));
          resolve(true);
        },
      });
    });
  };

  const handleCancel = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const Dialog = () => (
    <ConfirmDialog
      open={dialogState.open}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      variant={dialogState.variant}
      onConfirm={dialogState.onConfirm || (() => {})}
      onCancel={handleCancel}
    />
  );

  return { confirm, Dialog };
}
