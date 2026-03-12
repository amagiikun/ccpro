import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";

// GET /api/generations - 获取最近的图片生成记录
export async function GET() {
  const allGenerations = await db
    .select()
    .from(generations)
    .where(eq(generations.type, "image"))
    .orderBy(desc(generations.createdAt))
    .limit(100);

  return NextResponse.json(allGenerations);
}
