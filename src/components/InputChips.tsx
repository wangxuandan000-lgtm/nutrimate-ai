"use client";

import { ChangeEvent, KeyboardEvent, useState } from "react";

export default function InputChips({
  value = [],
  onChange,
  placeholder = "Add ingredient and press Enter",
}: {
  value?: string[];
  onChange?: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextValue = input.trim();
      if (!nextValue) return;
      onChange?.(Array.from(new Set([...(value || []), nextValue])));
      setInput("");
    }
  }

  function removeChip(chip: string) {
    onChange?.((value || []).filter((c) => c !== chip));
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {(value || []).map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-lg bg-[#E7F8EE] px-3 py-1 text-sm text-[#1F7A4D]"
          >
            {chip}
            <button
              type="button"
              className="ml-2 text-[#516053]"
              onClick={() => removeChip(chip)}
              aria-label={`Remove ${chip}`}
            >
              x
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#DDE7D7] bg-white p-3 outline-none"
      />
    </div>
  );
}
