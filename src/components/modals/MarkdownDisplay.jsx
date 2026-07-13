"use client";

import ReactMarkdown from "react-markdown";

export default function MarkdownDisplay({ recipeIngredients }) {
  const content = Array.isArray(recipeIngredients)
    ? recipeIngredients.join("\n\n")
    : String(recipeIngredients || "No steps yet.");

  return (
    <div className="prose prose-sm max-w-none text-sm leading-6 text-[#34483A]">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
