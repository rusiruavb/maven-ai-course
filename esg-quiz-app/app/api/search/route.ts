import { NextRequest, NextResponse } from 'next/server';
import { tavily } from '@tavily/core';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.TAVILY_API_KEY) {
      console.warn('⚠️  TAVILY_API_KEY is not configured. Web search feature will not work.');
      console.warn('💡 Add TAVILY_API_KEY to your .env.local file to enable learning resources.');
      return NextResponse.json(
        { error: 'Tavily API key not configured', resources: [] },
        { status: 500 }
      );
    }

    const { topic } = await req.json();

    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

    const response = await tavilyClient.search(topic, {
      maxResults: 3,
      includeAnswer: false,
    });

    const resources = response.results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content,
    }));

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error searching with Tavily:', error);
    return NextResponse.json(
      { error: 'Failed to search for resources', resources: [] },
      { status: 500 }
    );
  }
}
