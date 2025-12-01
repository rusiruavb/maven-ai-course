import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not configured.');
      console.error('💡 Add OPENAI_API_KEY to your .env.local file to generate quiz questions.');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { questionNumber } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an ESG (Environmental, Social, and Governance) and sustainability expert. Generate educational quiz questions about sustainability topics like climate change, renewable energy, corporate responsibility, circular economy, carbon footprint, biodiversity, social equity, and sustainable development goals.`,
        },
        {
          role: "user",
          content: `Generate question ${questionNumber} of 5 for an ESG sustainability quiz. Return a JSON object with this exact structure:
                    {
                      "question": "the question text",
                      "options": ["option A", "option B", "option C", "option D"],
                      "correctAnswer": 0,
                      "explanation": "detailed explanation of the correct answer",
                      "searchTopic": "relevant topic to search for more information"
                    }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const questionData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return NextResponse.json(questionData);
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
