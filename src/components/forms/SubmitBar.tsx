"use client";

import type { ButtonHTMLAttributes } from "react";

interface SubmitBarProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  submitting?: boolean;
  submitProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

const buttonBase =
  "inline-flex items-center justify-center rounded-md border border-slate-500 px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900";

export const SubmitBar = ({
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  onCancel,
  submitting = false,
  submitProps,
}: SubmitBarProps) => {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className={`${buttonBase} border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800`}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        className={`${buttonBase} border-sky-500 bg-sky-500 text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={submitting}
        {...submitProps}
      >
        {submitting ? "En cours..." : submitLabel}
      </button>
    </div>
  );
};

export default SubmitBar;
