import { NextRequest, NextResponse } from "next/server";
import { compilePrompt } from "@/lib/prompt-template";
import type { ParsedTokens } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style, parsedTokens, productionMode, aspectRatio } = body as {
      style: string;
      parsedTokens: ParsedTokens;
      productionMode?: boolean;
      aspectRatio?: string;
    };

    if (!style || !parsedTokens?.name) {
      return NextResponse.json(
        { error: "style and parsedTokens.name are required" },
        { status: 400 }
      );
    }

    const prompt = compilePrompt(style, parsedTokens, productionMode, aspectRatio);
    return NextResponse.json({ prompt });
  } catch (err) {
    console.error("Compile route error:", err);
    return NextResponse.json(
      { error: "Failed to compile prompt" },
      { status: 500 }
    );
  }
}
