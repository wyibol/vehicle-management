"use client";

import { AlertTriangle, Info } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "確定",
  cancelText = "キャンセル",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface-2 border border-hairline rounded-xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-2">
            {variant === "danger" ? (
              <AlertTriangle className="w-5 h-5 text-danger shrink-0" strokeWidth={1.75} />
            ) : (
              <Info className="w-5 h-5 text-ink-muted shrink-0" strokeWidth={1.75} />
            )}
            <h3 className="text-[17px] font-semibold tracking-[-0.2px] text-ink">{title}</h3>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={variant === "danger" ? "btn-danger" : "btn-primary"}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
