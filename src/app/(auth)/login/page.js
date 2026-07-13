"use client";

import { Leaf, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";

const highlights = [
  { icon: Sparkles, label: "AI meal plans" },
  { icon: WalletCards, label: "Budget aware" },
  { icon: ShieldCheck, label: "Allergy friendly" },
];

export default function LoginPage() {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  if (user) {
    if (typeof window !== "undefined") window.location.href = "/app";
    return null;
  }

  return (
    <main className="min-h-screen bg-[#E9EFE7] text-[#17251D] sm:flex sm:items-center sm:justify-center sm:p-6">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F8FAF4] px-5 pb-8 pt-6 shadow-sm sm:min-h-[860px] sm:rounded-[28px]">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#DFF4E7] p-3">
            <Leaf className="text-emerald-700" size={24} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6C7D70]">
              NutriMate AI
            </p>
            <h1 className="text-xl font-semibold">Smart food companion</h1>
          </div>
        </div>

        <div className="mt-10 rounded-lg bg-[#173326] p-5 text-white">
          <p className="text-sm text-[#B9DCC4]">Personal nutrition assistant</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            Plan meals around your goals, pantry, taste, and budget.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#DDEBDD]">
            NutriMate AI helps you turn ingredients into daily menus, weekly
            plans, shopping lists, and simple nutrition reports.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-[#E0E9DA] bg-white p-3"
              >
                <Icon className="text-emerald-700" size={18} />
                <p className="mt-2 text-xs font-medium leading-4 text-[#34483A]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-auto space-y-3 pt-8">
          <button
            onClick={() => openSignIn({ redirectUrl: "/app" })}
            className="w-full rounded-lg bg-[#1F7A4D] p-4 text-sm font-semibold text-white shadow-sm"
          >
            Continue with Login
          </button>
          <p className="text-center text-xs leading-5 text-[#6C7D70]">
            Keep your recipes, preferences, and nutrition plans in one place.
          </p>
        </div>
      </section>
    </main>
  );
}
