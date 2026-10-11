import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/sarvam';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model = 'sarvam-105b-conversations' } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const data = await chatCompletion(messages, model);

    // Safely return only conversational payloads to prevent leaking any headers or internal metadata
    return NextResponse.json(
      {
        id: data.id,
        model: data.model,
        choices: data.choices,
        usage: data.usage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to complete chat request' },
      { status: 500 }
    );
  }
}
