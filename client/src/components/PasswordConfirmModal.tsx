import React, { useState } from "react";
import { X } from "lucide-react";

interface PasswordConfirmModalProps {
  title: string;
  isSubmitting: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export default function PasswordConfirmModal({
  title,
  isSubmitting,
  onConfirm,
  onCancel,
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-[#171f31] border border-slate-200 dark:border-[#3a494a]/50 rounded-xl p-6 relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 dark:text-[#808e93] hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-[#01c8d2] mb-4">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-[#808e93] mb-1.5">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-[#0b1324] text-sm text-slate-900 dark:text-[#cbdfe2] px-3 py-2.5 rounded border border-slate-200 dark:border-[#3a494a] font-mono focus:outline-none focus:border-cyan-500 dark:focus:border-[#00dce5]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded border border-slate-200 dark:border-[#3a494a] text-xs font-bold text-slate-500 dark:text-[#808e93] hover:bg-slate-100 dark:hover:bg-[#3a494a]/30 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="flex-1 px-4 py-2.5 rounded border border-cyan-500/40 dark:border-[#00dce5]/40 bg-cyan-500/10 dark:bg-[#00dce5]/10 text-cyan-600 dark:text-[#00dce5] text-xs font-bold hover:bg-cyan-600 dark:hover:bg-[#00dce5] hover:text-white dark:hover:text-[#003739] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
