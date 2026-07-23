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

    const { ingredients } = await request.json();

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "请提供食材列表" },
        { status: 400 }
      );
    }

    const prompt = `
      You are a recipe assistant. Suggest 3 meal ideas using these ingredients:
      ${ingredients.join(", ")}.
      For each recipe, return:
      - title
      - short description
      - list of ingredients
      - estimated cooking time
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const aiText = response.choices[0].message.content;

    return NextResponse.json({ suggestions: aiText }, { status: 200 });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json(
      { error: "生成菜谱建议失败，请稍后重试" },
      { status: 500 }
    );
  }
}
