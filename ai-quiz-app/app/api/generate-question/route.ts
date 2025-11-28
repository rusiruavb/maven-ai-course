import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { SYSTEM_PROMPT, getUserPrompt } from "@/lib/prompts";
import { generateId } from "@/lib/utils";
import { GenerateQuestionRequest, Question } from "../types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionRequest = await request.json();
    console.log("body", body);
    const { previousTopics = [] } = body;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: getUserPrompt(previousTopics) },
      ],
      temperature: 0.8,
      stream: true,
    });

    const encoder = new TextEncoder();
    let accumulatedContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              accumulatedContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          try {
            const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsedQuestion = JSON.parse(jsonMatch[0]);
              const question: Question = {
                id: generateId(),
                ...parsedQuestion,
              };

              controller.enqueue(
                encoder.encode(`\n__COMPLETE__${JSON.stringify(question)}`)
              );
            }
          } catch (parseError) {
            console.error("Error parsing question JSON:", parseError);
            controller.enqueue(
              encoder.encode("\n__ERROR__Failed to parse question")
            );
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
