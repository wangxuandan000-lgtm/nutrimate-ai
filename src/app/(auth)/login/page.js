"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChefHat,
  Leaf,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";

const highlights = [
  { icon: Sparkles, label: "AI 个性餐单", detail: "结合目标与现有食材" },
  { icon: WalletCards, label: "预算可控", detail: "智能规划每周采购" },
  { icon: ShieldCheck, label: "忌口友好", detail: "记录过敏与饮食偏好" },
];

export default function LoginPage() {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  if (user) {
    if (typeof window !== "undefined") window.location.href = "/app";
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F3F6F0] text-[#173326]">
      <header className="border-b border-[#DEE7DA] bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="rounded-lg bg-[#DFF4E7] p-3">
              <Leaf className="text-emerald-700" size={24} />
            </span>
            <span>
              <span className="block text-xl font-bold">NutriMate AI</span>
              <span className="block text-xs text-[#6C7D70]">
                智能饮食与食材管理助手
              </span>
            </span>
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-lg border border-[#C8D8C5] bg-white px-4 py-2.5 text-sm font-semibold text-[#28583E] transition hover:bg-[#F2F8F1]"
          >
            直接查看演示
            <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-89px)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E3F3E5] px-4 py-2 text-sm font-semibold text-[#1F7047]">
            <Sparkles size={17} />
            面向健康生活的 AI 饮食助手
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-[#173326] md:text-5xl lg:text-6xl">
            让每一餐都更懂你的
            <span className="mt-2 block text-[#238557]">目标、口味与生活</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#536558]">
            根据饮食目标、预算、忌口和现有食材，生成每日餐单、一周计划、购物清单与营养报告。
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                  className="rounded-lg border border-[#DEE7DA] bg-white p-4 shadow-[0_8px_24px_rgba(30,65,44,0.05)]"
              >
                  <Icon className="text-emerald-700" size={21} />
                  <p className="mt-3 text-sm font-bold text-[#294537]">
                  {item.label}
                </p>
                  <p className="mt-1 text-xs leading-5 text-[#6C7D70]">
                    {item.detail}
                  </p>
              </div>
            );
          })}
          </div>
        </div>

        <aside className="rounded-lg border border-[#DDE6D8] bg-white p-6 shadow-[0_24px_70px_rgba(28,65,43,0.12)] md:p-8">
          <div className="rounded-lg bg-[#173B2A] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#B9DCC4]">今日健康概览</p>
                <p className="mt-2 text-3xl font-bold">营养评分 86</p>
              </div>
              <span className="rounded-lg bg-[#DFF4E7] p-4 text-[#1F7A4D]">
                <BarChart3 size={28} />
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[#B9DCC4]">热量</p>
                <p className="mt-1 font-semibold">1680 kcal</p>
              </div>
              <div>
                <p className="text-[#B9DCC4]">蛋白质</p>
                <p className="mt-1 font-semibold">92 g</p>
              </div>
              <div>
                <p className="text-[#B9DCC4]">饮水</p>
                <p className="mt-1 font-semibold">6 / 8 杯</p>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-[#EEF7ED] p-3 text-[#238557]">
                <ChefHat size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold">开始使用 NutriMate AI</h2>
                <p className="mt-1 text-sm text-[#6C7D70]">
                  登录后可同步你的菜谱、偏好和营养计划。
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-[#425649]">
              {["保存个性化一周餐单", "管理食材库存与保质期", "自动生成分类购物清单"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="rounded-full bg-[#E2F3E5] p-1 text-[#238557]">
                      <Check size={14} />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => openSignIn({ redirectUrl: "/app" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F7A4D] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17633E]"
          >
              登录并同步数据
              <ArrowRight size={17} />
          </button>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-lg border border-[#C8D8C5] bg-[#F8FAF4] px-5 py-3.5 text-sm font-semibold text-[#28583E] transition hover:bg-[#EEF5EC]"
            >
              免登录查看完整演示
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
