import { generateImageFromProvider } from "@/lib/ai/image-providers";
import { aspectRatios } from "@/lib/ai/types";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const generateSchema = z.object({
  providerId: z.string(),
  model: z.string(),
  prompt: z.string().min(1),
  negativePrompt: z.string().optional(),
  size: z.string().optional(),
  aspectRatio: z.enum(aspectRatios).optional(),
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = generateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const params = parsed.data;
  const generationId = nanoid();

  await db.insert(generations).values({
    id: generationId,
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    providerId: params.providerId,
    model: params.model,
    type: "image",
    status: "processing",
    parameters: {
      size: params.size,
      aspectRatio: params.aspectRatio,
    },
  });

  try {
    const result = await generateImageFromProvider(params);
    const resultUrl = `data:image/png;base64,${result.image.base64}`;

    await db
      .update(generations)
      .set({
        status: "completed",
        resultUrl,
      })
      .where(eq(generations.id, generationId));

    return NextResponse.json({
      id: generationId,
      imageUrl: resultUrl,
      status: "completed",
    });
  } catch (error) {
    await db
      .update(generations)
      .set({ status: "failed" })
      .where(eq(generations.id, generationId));

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "图片生成失败",
        id: generationId,
      },
      { status: 500 }
    );
  }
}
