import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generations } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

// GET /api/generations - 获取最近的图片生成记录
export async function GET() {
  const allGenerations = await getDb()
    .select()
    .from(generations)
    .where(eq(generations.type, "image"))
    .orderBy(desc(generations.createdAt))
    .limit(100);

  return NextResponse.json(allGenerations);
}
