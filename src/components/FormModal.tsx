"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

export default function FormModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <div className="relative w-full max-w-xl rounded-t-lg border border-[#E0E9DA] bg-[#F8FAF4] p-5 shadow-lg sm:rounded-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#173326]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white p-2 text-[#516053]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
