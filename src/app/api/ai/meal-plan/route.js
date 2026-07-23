import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "当前使用模拟数据，尚未配置真实 AI 服务" },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { days, preferences } = await request.json();

    if (!days) {
      return NextResponse.json(
        { error: "请选择需要生成的餐单天数" },
        { status: 400 }
      );
    }

    const prompt = `
      Create a ${days}-day meal plan.
      Preferences: ${preferences || "none"}.
      Format each day with:
      - Breakfast
      - Lunch
      - Dinner
      - Short snack suggestion
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 700,
    });

    const mealPlan = response.choices[0].message.content;

    return NextResponse.json({ mealPlan }, { status: 200 });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json(
      { error: "生成餐单失败，请稍后重试" },
      { status: 500 }
    );
  }
}
