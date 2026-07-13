"use client";

import {
  BarChart3,
  Beef,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Droplets,
  Heart,
  Home,
  Leaf,
  Package,
  Plus,
  RefreshCcw,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  User,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import FormModal from "../../components/FormModal";
import InputChips from "../../components/InputChips";
import Logo from "../../components/Logo";
import Spinner from "../../components/Spinner";
import { useRecipes } from "../../context/RecipesContext";
import {
  mockAiPlan,
  mockMeals,
  mockNutritionReport,
  mockPantryItems,
  mockRecipes,
  mockShoppingList,
  mockUserProfile,
} from "../../lib/mockData";

type ViewKey =
  | "home"
  | "aiPlan"
  | "recipes"
  | "recipeDetail"
  | "pantry"
  | "shopping"
  | "profile";

type MockRecipe = (typeof mockRecipes)[number];

const navigation = [
  { key: "home", label: "Home", icon: Home },
  { key: "aiPlan", label: "AI Plan", icon: Sparkles },
  { key: "recipes", label: "Recipes", icon: BookOpen },
  { key: "pantry", label: "Pantry", icon: Package },
  { key: "shopping", label: "Shopping", icon: ShoppingCart },
  { key: "profile", label: "Profile", icon: User },
] as const;

const recipeFilters = ["全部", "早餐", "午餐", "晚餐", "高蛋白", "低卡", "快手菜"];
const pantryCategories = ["全部", "蔬菜", "肉蛋奶", "主食", "调味品", "水果"];
const goalOptions = ["减脂", "增肌", "控糖", "均衡饮食", "轻食养生"];
const quickActions: {
  title: string;
  desc: string;
  Icon: LucideIcon;
  target: ViewKey;
}[] = [
  { title: "AI Meal Plan", desc: "生成今日和一周餐单", Icon: Sparkles, target: "aiPlan" },
  { title: "Fridge to Recipe", desc: "用现有食材组合菜谱", Icon: Package, target: "pantry" },
  { title: "Smart Shopping List", desc: "自动补齐缺失食材", Icon: ShoppingCart, target: "shopping" },
  { title: "Nutrition Report", desc: "查看本周营养趋势", Icon: BarChart3, target: "profile" },
];

export default function AppPage() {
  const {
    recipes,
    loading: recipesLoading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipes();

  const [current, setCurrent] = useState<ViewKey>("home");
  const [selectedRecipe, setSelectedRecipe] = useState<MockRecipe>(mockRecipes[0]);
  const [recipeFilter, setRecipeFilter] = useState("全部");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [pantryFilter, setPantryFilter] = useState("全部");
  const [aiGoal, setAiGoal] = useState("均衡饮食");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [recipeIdeas, setRecipeIdeas] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formIngredients, setFormIngredients] = useState<string[]>([]);
  const [formSteps, setFormSteps] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [refetchingAfterDelete, setRefetchingAfterDelete] = useState(false);
  const [shoppingChecked, setShoppingChecked] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        mockShoppingList.flatMap((group) =>
          group.items.map((item) => [item.id, item.checked])
        )
      )
  );
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const aiChipsRef = useRef<HTMLDivElement | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([
    "菠菜",
    "番茄",
    "鸡蛋",
  ]);

  const filteredRecipes = useMemo(() => {
    const keyword = recipeSearch.trim().toLowerCase();
    return mockRecipes.filter((recipe) => {
      const matchesFilter =
        recipeFilter === "全部" ||
        recipe.category === recipeFilter ||
        recipe.tags.includes(recipeFilter);
      const matchesSearch =
        !keyword ||
        recipe.name.toLowerCase().includes(keyword) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(keyword));
      return matchesFilter && matchesSearch;
    });
  }, [recipeFilter, recipeSearch]);

  const filteredPantry = useMemo(
    () =>
      mockPantryItems.filter(
        (item) => pantryFilter === "全部" || item.category === pantryFilter
      ),
    [pantryFilter]
  );

  useEffect(() => {
    if (!recipesLoading && refetchingAfterDelete) {
      setRefetchingAfterDelete(false);
    }
  }, [recipesLoading, refetchingAfterDelete]);

  function navigate(next: ViewKey) {
    setCurrent(next);
  }

  function openRecipeDetail(recipe: MockRecipe) {
    setSelectedRecipe(recipe);
    setCurrent("recipeDetail");
  }

  function runAiPlan() {
    setPlanLoading(true);
    setTimeout(() => {
      setAiGenerated(true);
      setRecipeIdeas([
        "番茄豆腐蔬菜汤",
        "三文鱼菠菜糙米碗",
        "鸡蛋牛油果吐司",
      ]);
      setPlanLoading(false);
      toast.success("AI meal plan 已生成。");
    }, 500);
  }

  function generateRecipeIdeas() {
    setRecipeIdeas([
      "优先使用番茄和鸡蛋：番茄豆腐蔬菜汤",
      "使用菠菜补充深色蔬菜：三文鱼菠菜糙米碗",
      "快速早餐方案：鸡蛋牛油果吐司",
    ]);
    toast.success("已根据现有食材生成菜谱建议。");
  }

  function openCreate() {
    setEditing(null);
    setFormTitle("");
    setFormIngredients([]);
    setFormSteps("");
    setModalOpen(true);
  }

  function openEdit(recipe: any) {
    setEditing(recipe);
    setFormTitle(recipe.title || "");
    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((i: any) => (typeof i === "string" ? i : i.name))
      : [];
    setFormIngredients(ingredients);
    const steps = Array.isArray(recipe.steps)
      ? recipe.steps.join("\n")
      : recipe.steps || "";
    setFormSteps(steps);
    setModalOpen(true);
  }

  async function saveRecipe(e: FormEvent) {
    e.preventDefault();
    const pendingInput =
      (
        chipsRef.current?.querySelector("input") as HTMLInputElement | null
      )?.value?.trim() || "";
    const mergedIngredients = Array.from(
      new Set([
        ...(formIngredients || []),
        ...(pendingInput ? [pendingInput] : []),
      ])
    );

    if (mergedIngredients.length === 0) {
      toast.warning("Please add at least one ingredient.");
      return;
    }

    try {
      setActionLoadingId(editing ? editing._id || editing.id : "new");
      if (editing) {
        await updateRecipe(editing._id || editing.id, {
          title: formTitle,
          ingredients: mergedIngredients,
          steps: formSteps,
        });
        toast.success("Recipe updated successfully.");
      } else {
        await addRecipe({
          title: formTitle,
          ingredients: mergedIngredients,
          steps: formSteps,
        });
        toast.success("Recipe added successfully.");
      }
      setModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.data?.error ||
        err?.data?.msg ||
        err?.message ||
        "Something went wrong";
      toast.error(msg);
      setModalOpen(false);
    } finally {
      setActionLoadingId(null);
    }
  }

  function generateAiStepsForForm() {
    if (!formIngredients?.length) {
      toast.warning("Please add at least one ingredient to generate steps.");
      return;
    }
    setFormSteps(
      "清洗并处理所有食材。\n根据蛋白质和蔬菜熟成时间分批烹饪。\n少油调味，装盘后补充香草或柠檬汁。"
    );
    toast.success("已生成 mock AI cooking steps。");
  }

  function toggleShoppingItem(id: string) {
    setShoppingChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function addToShoppingList(name = selectedRecipe.name) {
    toast.success(`${name} 需要的缺失食材已加入购物清单。`);
    setCurrent("shopping");
  }

  const activeNav = current === "recipeDetail" ? "recipes" : current;

  return (
    <main className="min-h-screen bg-[#F5F7F1] text-[#17251D]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8DA] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                  style={{
                    background: active ? "#E2F3E8" : "transparent",
                    color: active ? "#1F7A4D" : "#516053",
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#F1F5EC] px-4 py-2 text-sm font-medium text-[#516053] sm:inline-flex">
              {mockUserProfile.goal}
            </span>
            <UserButton />
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-3 md:hidden">
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#516053]"
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {current === "home" ? renderHome() : null}
        {current === "aiPlan" ? renderAiPlan() : null}
        {current === "recipes" ? renderRecipes() : null}
        {current === "recipeDetail" ? renderRecipeDetail() : null}
        {current === "pantry" ? renderPantry() : null}
        {current === "shopping" ? renderShopping() : null}
        {current === "profile" ? renderProfile() : null}
      </div>

      <FormModal
        open={modalOpen}
        title={editing ? "Edit Recipe" : "Add Recipe"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveRecipe} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-[#516053]">Title</span>
            <input
              className="w-full rounded-2xl border border-[#DDE7D7] bg-white p-3 outline-none"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#516053]">
              Ingredients
            </span>
            <div ref={chipsRef}>
              <InputChips
                value={formIngredients}
                onChange={setFormIngredients}
                placeholder="Add ingredient and press Enter"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={generateAiStepsForForm}
            className="inline-flex items-center gap-2 rounded-full bg-[#E2F3E8] px-4 py-2 text-sm font-semibold text-[#1F7A4D]"
          >
            <Sparkles size={16} />
            Generate Steps with AI
          </button>
          <label className="block">
            <span className="mb-1 block text-sm text-[#516053]">Steps</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-[#DDE7D7] bg-white p-3 outline-none"
              value={formSteps}
              onChange={(e) => setFormSteps(e.target.value)}
              required
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full bg-[#F1F5EC] px-5 py-2 font-medium text-[#516053]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(actionLoadingId)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1F7A4D] px-5 py-2 font-semibold text-white"
            >
              {actionLoadingId ? <Spinner size={16} /> : null}
              {editing ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </FormModal>
    </main>
  );

  function renderHome() {
    const today = new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(new Date());

    return (
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="rounded-[28px] bg-[#173326] p-8 text-white shadow-sm">
            <p className="text-sm text-[#B9DCC4]">{today}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Hi，今天想吃得更健康一点吗？
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#DDEBDD]">
              当前目标：{mockUserProfile.goal}。NutriMate AI 会结合你的口味、
              忌口、预算和现有食材，生成更容易坚持的健康餐单。
            </p>
            <button
              onClick={() => {
                setCurrent("aiPlan");
                runAiPlan();
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D8F5A2] px-6 py-3 font-semibold text-[#173326]"
            >
              <Sparkles size={18} />
              Generate Today&apos;s Meal Plan
            </button>
          </div>

          <div className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6C7D70]">AI 健康评分</p>
                <p className="mt-2 text-5xl font-semibold text-[#1F7A4D]">
                  {mockNutritionReport.weekly.score}
                </p>
              </div>
              <div className="rounded-3xl bg-[#E2F3E8] p-4 text-[#1F7A4D]">
                <BarChart3 size={32} />
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#516053]">
              本周蛋白质摄入稳定，建议增加深色蔬菜，并减少高糖零食。
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={Target} label="今日热量" value={`${mockNutritionReport.calories.value}`} unit="kcal" />
          <MetricCard icon={Beef} label="蛋白质" value={`${mockNutritionReport.protein.value}`} unit="g" />
          <MetricCard icon={BarChart3} label="碳水" value={`${mockNutritionReport.carbs.value}`} unit="g" />
          <MetricCard icon={Leaf} label="脂肪" value={`${mockNutritionReport.fat.value}`} unit="g" />
          <MetricCard icon={Droplets} label="饮水提醒" value={`${mockNutritionReport.water.value}/${mockNutritionReport.water.target}`} unit="杯" />
        </section>

        <SectionHeader
          title="今日推荐餐单"
          description="根据当前目标和食材库存生成的消费级健康餐单。"
        />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockMeals.map((meal) => (
            <article key={meal.type} className="rounded-[24px] border border-[#E2E8DA] bg-white p-5 shadow-sm">
              <span className="rounded-full bg-[#E2F3E8] px-3 py-1 text-xs font-semibold text-[#1F7A4D]">
                {meal.type}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#173326]">
                {meal.name}
              </h3>
              <div className="mt-4 flex items-center gap-4 text-sm text-[#6C7D70]">
                <span>{meal.calories} kcal</span>
                <span>{meal.time}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#516053]">
                {meal.reason}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ title, desc, Icon, target }) => (
            <button
              key={title}
              onClick={() => setCurrent(target)}
              className="rounded-[24px] border border-[#E2E8DA] bg-white p-5 text-left shadow-sm"
            >
              <Icon className="text-[#1F7A4D]" size={24} />
              <h3 className="mt-4 font-semibold text-[#173326]">{title}</h3>
              <p className="mt-2 text-sm text-[#6C7D70]">{desc}</p>
            </button>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <ReminderCard title="即将过期食材" items={["番茄：1 天", "菠菜：2 天"]} />
          <ReminderCard title="库存不足食材" items={["鸡蛋：剩余 3 个", "蓝莓：未购买"]} />
          <ReminderCard title="AI 推荐优先使用" items={["菠菜", "番茄", "鸡蛋"]} />
        </section>
      </div>
    );
  }

  function renderAiPlan() {
    return (
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
          <SectionHeader
            title="AI Plan"
            description="输入你的目标、偏好、预算和现有食材，生成适合本周执行的饮食方案。"
          />
          <div className="mt-6 space-y-6">
            <div>
              <Label>饮食目标</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setAiGoal(goal)}
                    className="rounded-full border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: aiGoal === goal ? "#1F7A4D" : "#DDE7D7",
                      background: aiGoal === goal ? "#E2F3E8" : "#FFFFFF",
                      color: aiGoal === goal ? "#1F7A4D" : "#516053",
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="口味偏好" defaultValue={mockUserProfile.taste} />
              <Field label="忌口" defaultValue={mockUserProfile.avoid} />
              <Field label="预算" defaultValue={mockUserProfile.budget} />
              <Field label="用餐人数" defaultValue="2 人" />
              <Field label="烹饪时间" defaultValue={mockUserProfile.cookingTime} />
            </div>

            <div ref={aiChipsRef}>
              <Label>当前已有食材</Label>
              <div className="mt-2">
                <InputChips
                  value={availableIngredients}
                  onChange={setAvailableIngredients}
                  placeholder="输入食材并按 Enter"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={runAiPlan}
                disabled={planLoading}
                className="inline-flex items-center gap-2 rounded-full bg-[#1F7A4D] px-6 py-3 font-semibold text-white"
              >
                {planLoading ? <Spinner size={16} /> : <Sparkles size={18} />}
                Generate AI Meal Plan
              </button>
              <button
                onClick={generateRecipeIdeas}
                className="rounded-full bg-[#E2F3E8] px-6 py-3 font-semibold text-[#1F7A4D]"
              >
                Fridge to Recipe
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#173326]">AI 分析过程</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {mockAiPlan.analysis.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl bg-[#F5F7F1] p-4">
                  <CheckCircle2
                    size={20}
                    className={aiGenerated || planLoading ? "text-[#1F7A4D]" : "text-[#A9B6A6]"}
                  />
                  <span className="text-sm font-medium text-[#34483A]">
                    {planLoading && index === 3 ? "正在生成中..." : step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#173326]">
                  AI 生成结果
                </h2>
                <p className="mt-1 text-sm text-[#6C7D70]">
                  {aiGenerated ? mockAiPlan.reason : "点击生成后展示完整结果。"}
                </p>
              </div>
              <div className="rounded-3xl bg-[#E2F3E8] px-5 py-3 text-center">
                <p className="text-xs text-[#6C7D70]">营养评分</p>
                <p className="text-2xl font-semibold text-[#1F7A4D]">
                  {aiGenerated ? mockAiPlan.score : "--"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <ResultBlock title="今日推荐餐单" items={aiGenerated ? mockAiPlan.today : ["等待生成"]} />
              <ResultBlock title="一周饮食计划摘要" items={aiGenerated ? mockAiPlan.weeklySummary : ["等待生成"]} />
              <ResultBlock title="需要购买的食材" items={aiGenerated ? mockAiPlan.groceries : ["等待生成"]} />
              <ResultBlock title="AI 推荐菜谱" items={recipeIdeas.length ? recipeIdeas : ["点击 Fridge to Recipe 查看建议"]} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => toast.success("Plan saved.")} className="rounded-full bg-[#1F7A4D] px-5 py-2 font-semibold text-white">
                Save Plan
              </button>
              <button onClick={() => addToShoppingList("AI Plan")} className="rounded-full bg-[#E2F3E8] px-5 py-2 font-semibold text-[#1F7A4D]">
                Add to Shopping List
              </button>
              <button onClick={runAiPlan} className="inline-flex items-center gap-2 rounded-full bg-[#F1F5EC] px-5 py-2 font-semibold text-[#516053]">
                <RefreshCcw size={16} />
                Regenerate
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderRecipes() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionHeader title="Recipes" description="浏览适合不同目标的健康菜谱，也可以继续管理你自己的菜谱。" />
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-[#1F7A4D] px-5 py-3 font-semibold text-white">
            <Plus size={18} />
            Add Recipe
          </button>
        </div>

        <div className="rounded-[28px] border border-[#E2E8DA] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B9A8D]" size={18} />
              <input
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                placeholder="搜索菜名、标签或食材"
                className="w-full rounded-full border border-[#DDE7D7] py-3 pl-11 pr-4 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {recipeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRecipeFilter(filter)}
                  className="rounded-full px-4 py-2 text-sm font-medium"
                  style={{
                    background: recipeFilter === filter ? "#1F7A4D" : "#F1F5EC",
                    color: recipeFilter === filter ? "#FFFFFF" : "#516053",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredRecipes.map((recipe) => (
            <RecipeGridCard key={recipe.id} recipe={recipe} onOpen={openRecipeDetail} />
          ))}
        </div>

        <section className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#173326]">我的菜谱管理</h2>
              <p className="mt-1 text-sm text-[#6C7D70]">
                保留原项目的新增、编辑、删除能力。
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recipesLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-3xl bg-[#F1F5EC]" />
                ))
              : recipes.map((recipe: any) => (
                  <div key={recipe._id || recipe.id} className="rounded-3xl border border-[#E2E8DA] p-4">
                    <h3 className="font-semibold text-[#173326]">{recipe.title}</h3>
                    <p className="mt-2 text-sm text-[#6C7D70]">
                      {Array.isArray(recipe.ingredients)
                        ? recipe.ingredients
                            .map((item: any) => (typeof item === "string" ? item : item.name))
                            .filter(Boolean)
                            .slice(0, 4)
                            .join(", ")
                        : ""}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openEdit(recipe)} className="rounded-full bg-[#E2F3E8] px-4 py-2 text-sm font-medium text-[#1F7A4D]">
                        Edit
                      </button>
                      <button
                        disabled={actionLoadingId === (recipe._id || recipe.id)}
                        onClick={async () => {
                          setActionLoadingId(recipe._id || recipe.id);
                          try {
                            setRefetchingAfterDelete(true);
                            await deleteRecipe(recipe._id || recipe.id);
                            toast.success("Recipe deleted successfully.");
                          } catch (err: any) {
                            toast.error(err?.message || "Failed to delete");
                          } finally {
                            setActionLoadingId(null);
                          }
                        }}
                        className="rounded-full bg-[#FFF0EE] px-4 py-2 text-sm font-medium text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            {!recipesLoading && recipes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#CAD8C5] p-6 text-[#516053]">
                暂无自建菜谱。可以点击 Add Recipe 添加你的第一道健康菜。
              </div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  function renderRecipeDetail() {
    return (
      <div className="space-y-6">
        <button onClick={() => setCurrent("recipes")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F7A4D]">
          <ChevronLeft size={18} />
          返回菜谱
        </button>
        <section className="overflow-hidden rounded-[32px] border border-[#E2E8DA] bg-white shadow-sm">
          <div className={`flex min-h-[280px] items-end bg-gradient-to-br ${selectedRecipe.gradient} p-8`}>
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              <h1 className="mt-5 text-4xl font-semibold text-[#173326]">
                {selectedRecipe.name}
              </h1>
              <p className="mt-3 max-w-2xl text-[#516053]">{selectedRecipe.reason}</p>
            </div>
          </div>
          <div className="grid gap-8 p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <NutritionMini label="热量" value={`${selectedRecipe.calories} kcal`} />
                <NutritionMini label="蛋白质" value={`${selectedRecipe.protein}g`} />
                <NutritionMini label="碳水" value={`${selectedRecipe.carbs}g`} />
                <NutritionMini label="脂肪" value={`${selectedRecipe.fat}g`} />
              </div>
              <div className="rounded-3xl bg-[#F5F7F1] p-5">
                <h2 className="font-semibold text-[#173326]">食材清单</h2>
                <div className="mt-4 space-y-3">
                  {selectedRecipe.ingredients.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[#6C7D70]">{item.amount}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.inPantry ? "bg-[#E2F3E8] text-[#1F7A4D]" : "bg-[#FFF0EE] text-rose-600"}`}>
                        {item.inPantry ? "Pantry 已有" : "需要购买"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#173326]">制作步骤</h2>
                <ol className="mt-4 space-y-4">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E2F3E8] text-sm font-semibold text-[#1F7A4D]">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-[#34483A]">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-3xl bg-[#F1F5EC] p-5">
                <h2 className="font-semibold text-[#173326]">AI 小提示</h2>
                <p className="mt-2 text-sm leading-6 text-[#516053]">
                  {selectedRecipe.aiTip}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => toast.success("已加入今日餐单。")} className="rounded-full bg-[#1F7A4D] px-5 py-3 font-semibold text-white">
                  加入今日餐单
                </button>
                <button onClick={() => addToShoppingList()} className="rounded-full bg-[#E2F3E8] px-5 py-3 font-semibold text-[#1F7A4D]">
                  加入购物清单
                </button>
                <button onClick={() => toast.success("已收藏菜谱。")} className="inline-flex items-center gap-2 rounded-full bg-[#F1F5EC] px-5 py-3 font-semibold text-[#516053]">
                  <Heart size={16} />
                  收藏菜谱
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderPantry() {
    const expiring = mockPantryItems.filter((item) => item.status === "即将过期").length;
    const lowStock = mockPantryItems.filter((item) => item.status === "库存不足").length;

    return (
      <div className="space-y-6">
        <SectionHeader title="Pantry" description="用卡片管理食材库存，优先发现即将过期和库存不足的食材。" />
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard icon={Package} label="总食材数量" value={`${mockPantryItems.length}`} unit="种" />
          <MetricCard icon={Clock} label="即将过期" value={`${expiring}`} unit="种" />
          <MetricCard icon={ShoppingCart} label="库存不足" value={`${lowStock}`} unit="种" />
        </section>
        <div className="flex flex-wrap gap-2">
          {pantryCategories.map((category) => (
            <button
              key={category}
              onClick={() => setPantryFilter(category)}
              className="rounded-full px-4 py-2 text-sm font-medium"
              style={{
                background: pantryFilter === category ? "#1F7A4D" : "#FFFFFF",
                color: pantryFilter === category ? "#FFFFFF" : "#516053",
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredPantry.map((item) => (
            <article key={item.id} className="rounded-[24px] border border-[#E2E8DA] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#6C7D70]">{item.category}</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#173326]">{item.name}</h3>
                </div>
                <StatusTag status={item.status} />
              </div>
              <div className="mt-5 space-y-2 text-sm text-[#516053]">
                <p>数量：{item.quantity}</p>
                <p>过期时间：{item.expiresIn}</p>
                <p>推荐用途：{item.use}</p>
              </div>
            </article>
          ))}
        </section>
        <section className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
          <SectionHeader title="AI 推荐菜谱" description="优先使用即将过期的鸡蛋、番茄和菠菜，减少浪费。" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {mockRecipes.slice(0, 3).map((recipe) => (
              <button key={recipe.id} onClick={() => openRecipeDetail(recipe)} className="rounded-3xl bg-[#F5F7F1] p-5 text-left">
                <h3 className="font-semibold text-[#173326]">{recipe.name}</h3>
                <p className="mt-2 text-sm text-[#6C7D70]">{recipe.reason}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderShopping() {
    const totalItems = mockShoppingList.reduce((sum, group) => sum + group.items.length, 0);
    const checkedItems = Object.values(shoppingChecked).filter(Boolean).length;

    return (
      <div className="space-y-6">
        <SectionHeader title="Shopping" description="自动生成的本周购物清单，和 AI Plan 保持同步。" />
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard icon={WalletCards} label="预计花费" value="148" unit="元" />
          <MetricCard icon={ShoppingCart} label="食材数量" value={`${totalItems}`} unit="项" />
          <MetricCard icon={CheckCircle2} label="已购买" value={`${checkedItems}`} unit="项" />
        </section>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => toast.success("已根据 AI Plan 生成购物清单。")} className="rounded-full bg-[#1F7A4D] px-5 py-3 font-semibold text-white">
            一键生成购物清单
          </button>
          <button onClick={() => setShoppingChecked({})} className="rounded-full bg-[#F1F5EC] px-5 py-3 font-semibold text-[#516053]">
            清空已购买
          </button>
          <button onClick={() => toast.success("自定义食材入口已准备。")} className="rounded-full bg-[#E2F3E8] px-5 py-3 font-semibold text-[#1F7A4D]">
            添加自定义食材
          </button>
        </div>
        <section className="grid gap-5 lg:grid-cols-2">
          {mockShoppingList.map((group) => (
            <div key={group.group} className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#173326]">{group.group}</h2>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <label key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#F5F7F1] p-4">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(shoppingChecked[item.id])}
                        onChange={() => toggleShoppingItem(item.id)}
                        className="h-4 w-4 accent-[#1F7A4D]"
                      />
                      <span>
                        <span className="block font-semibold text-[#173326]">{item.name}</span>
                        <span className="text-sm text-[#6C7D70]">{item.amount}</span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-[#1F7A4D]">{item.price}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }

  function renderProfile() {
    return (
      <div className="space-y-6">
        <SectionHeader title="Profile" description="饮食偏好、目标和营养报告集中展示。" />
        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-[#E2F3E8] p-4 text-[#1F7A4D]">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#173326]">{mockUserProfile.nickname}</h2>
                <p className="text-[#6C7D70]">当前目标：{mockUserProfile.goal}</p>
              </div>
            </div>
            <div className="mt-6 rounded-3xl bg-[#F5F7F1] p-5">
              <p className="text-sm text-[#6C7D70]">连续记录天数</p>
              <p className="mt-2 text-4xl font-semibold text-[#1F7A4D]">
                {mockUserProfile.streakDays} 天
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PreferenceCard label="口味偏好" value={mockUserProfile.taste} />
            <PreferenceCard label="忌口" value={mockUserProfile.avoid} />
            <PreferenceCard label="预算" value={mockUserProfile.budget} />
            <PreferenceCard label="烹饪时间偏好" value={mockUserProfile.cookingTime} />
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={Target} label="平均热量" value={mockNutritionReport.weekly.averageCalories} unit="" />
          <MetricCard icon={Beef} label="蛋白质达标率" value={mockNutritionReport.weekly.proteinRate} unit="" />
          <MetricCard icon={Leaf} label="蔬菜摄入频率" value={mockNutritionReport.weekly.vegetableFrequency} unit="" />
          <MetricCard icon={Star} label="AI 健康评分" value={`${mockNutritionReport.weekly.score}`} unit="分" />
        </section>
        <section className="rounded-[28px] border border-[#E2E8DA] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#173326]">AI 建议</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {mockNutritionReport.suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-3xl bg-[#F5F7F1] p-5 text-sm leading-6 text-[#516053]">
                {suggestion}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#173326]">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6C7D70]">
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: any;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#E2E8DA] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6C7D70]">{label}</p>
        <Icon size={20} className="text-[#1F7A4D]" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-[#173326]">
        {value}
        {unit ? <span className="ml-1 text-sm text-[#6C7D70]">{unit}</span> : null}
      </p>
    </div>
  );
}

function ReminderCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-[#E2E8DA] bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-[#173326]">{title}</h3>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-2xl bg-[#F5F7F1] px-4 py-3 text-sm text-[#516053]">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-2xl border border-[#DDE7D7] bg-white p-3 outline-none"
      />
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-[#516053]">{children}</span>;
}

function ResultBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-[#F5F7F1] p-5">
      <h3 className="font-semibold text-[#173326]">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-[#516053]">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function RecipeGridCard({
  recipe,
  onOpen,
}: {
  recipe: MockRecipe;
  onOpen: (recipe: MockRecipe) => void;
}) {
  return (
    <button
      onClick={() => onOpen(recipe)}
      className="overflow-hidden rounded-[28px] border border-[#E2E8DA] bg-white text-left shadow-sm"
    >
      <div className={`flex h-44 items-end bg-gradient-to-br ${recipe.gradient} p-5`}>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#1F7A4D]">
          {recipe.imageLabel}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[#173326]">{recipe.name}</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-[#6C7D70]">
          <span>{recipe.calories} kcal</span>
          <span>{recipe.protein}g 蛋白</span>
          <span>{recipe.time}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag>{recipe.difficulty}</Tag>
          {recipe.tags.slice(0, 2).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#E2F3E8] px-3 py-1 text-xs font-semibold text-[#1F7A4D]">
      {children}
    </span>
  );
}

function NutritionMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#F5F7F1] p-4">
      <p className="text-xs text-[#6C7D70]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#173326]">{value}</p>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const styles =
    status === "即将过期"
      ? "bg-[#FFF2C2] text-[#8A6A00]"
      : status === "库存不足"
      ? "bg-[#FFF0EE] text-rose-600"
      : "bg-[#E2F3E8] text-[#1F7A4D]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function PreferenceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#E2E8DA] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#6C7D70]">{label}</p>
      <p className="mt-2 font-semibold text-[#173326]">{value}</p>
    </div>
  );
}
