"use client";

import { Leaf } from "lucide-react";

export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg p-2" style={{ background: "#E7F8EE" }}>
        <Leaf size={size} className="text-emerald-600" />
      </div>
      <span className="font-semibold" style={{ color: "#173326" }}>
        NutriMate AI
      </span>
    </div>
  );
}
