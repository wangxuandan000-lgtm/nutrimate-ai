"use client";

import Image from "next/image";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import SingleRecipeModal from "./modals/SingleRecipeModal";
import Spinner from "./Spinner";

export interface RecipeLike {
  _id?: string;
  id?: string;
  title: string;
  ingredients?: Array<string | { name?: string }>;
  steps?: string[] | string;
  imageUrl?: string;
}

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23e7f3e8'/%3E%3Ccircle cx='210' cy='170' r='74' fill='%23f7d87c'/%3E%3Ccircle cx='310' cy='160' r='58' fill='%238bcf9d'/%3E%3Ccircle cx='410' cy='188' r='76' fill='%23f4a7a1'/%3E%3Cpath d='M150 250c90 40 260 42 360 0' stroke='%231f7a4d' stroke-width='26' stroke-linecap='round' fill='none'/%3E%3C/svg%3E";

export default function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  busy = false,
}: {
  recipe: RecipeLike;
  onEdit?: (r: RecipeLike) => void;
  onDelete?: (r: RecipeLike) => void;
  busy?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const preview = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .slice(0, 3)
        .map((ing) => (typeof ing === "string" ? ing : ing?.name))
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <>
      <article className="overflow-hidden rounded-lg border border-[#E0E9DA] bg-white">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="block w-full text-left"
        >
          <div className="relative h-36 w-full">
            <Image
              src={recipe.imageUrl || fallbackImage}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="430px"
            />
          </div>
        </button>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="min-w-0 flex-1 text-left"
            >
              <h3 className="truncate font-semibold text-[#173326]">
                {recipe.title}
              </h3>
              <p className="mt-1 text-sm text-[#6C7D70]">
                {preview}
                {Array.isArray(recipe.ingredients) &&
                recipe.ingredients.length > 3
                  ? "..."
                  : ""}
              </p>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              {busy ? (
                <Spinner size={16} />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit?.(recipe)}
                    className="rounded-lg bg-[#EEF6E9] p-2"
                    aria-label="Edit recipe"
                  >
                    <Pencil size={16} className="text-emerald-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(recipe)}
                    className="rounded-lg bg-[#FFF0EE] p-2"
                    aria-label="Delete recipe"
                  >
                    <Trash2 size={16} className="text-rose-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      <SingleRecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipeIngredients={recipe.steps}
        recipeTitle={recipe.title}
      />
    </>
  );
}
