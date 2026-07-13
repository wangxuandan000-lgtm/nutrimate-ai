"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import MarkdownDisplay from "./MarkdownDisplay";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeIngredients?: any;
  recipeTitle: string;
}

const SingleRecipeModal = ({
  isOpen,
  onClose,
  recipeIngredients,
  recipeTitle,
}: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[82vh] w-full max-w-[430px] overflow-y-auto rounded-t-lg border border-[#E0E9DA] bg-[#F8FAF4] p-5 shadow-lg sm:rounded-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#173326]">
            {recipeTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white p-2 text-[#516053]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <MarkdownDisplay recipeIngredients={recipeIngredients} />
      </div>
    </div>
  );
};

export default SingleRecipeModal;
