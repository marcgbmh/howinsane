import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Given this historical event or situation: "${query}", rate it on an "insanity scale" from 1-10 (where 10 is the most insane) and then find 3 similar historical events, also rating each on the same scale. For the input event and each comparison, provide a brief description explaining the rating. Format your response as a JSON array with objects containing "event", "description", and "insanityRating" fields, with the input event as the first item. Be objective and factual in your comparisons.`,
        },
      ],
    });

    // Parse the response to get the events
    console.log("Message response:", JSON.stringify(message, null, 2));
    const textBlock = message.content.find(block => block.type === 'text');
    if (!textBlock || !('text' in textBlock)) {
      throw new Error("No text content found in the response");
    }
    const content = textBlock.text;

    try {
      // Extract the JSON array part from the text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not find JSON array in response");
      }
      const events = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ events });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
