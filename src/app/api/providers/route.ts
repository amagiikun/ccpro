import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { decrypt, encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { providers } from "@/lib/db/schema";

const providerTypeSchema = z.enum(["openai-compatible", "google"]);
const capabilitySchema = z.array(z.literal("image")).min(1);
const providerModelSchema = z.object({
  id: z.string().trim().min(1, "模型 ID 不能为空"),
  name: z.string().trim().min(1, "模型名称不能为空"),
  type: z.literal("image"),
});

const providerCreateSchema = z.object({
  name: z.string().trim().min(1, "名称不能为空"),
  type: providerTypeSchema,
  capabilities: capabilitySchema,
  baseURL: z.string().url("请输入有效的 URL"),
  apiKey: z.string().trim().min(1, "API Key 不能为空"),
  models: z.array(providerModelSchema).min(1, "至少添加一个图片模型"),
  isEnabled: z.boolean().default(true),
});

const providerUpdateSchema = z.object({
  name: z.string().trim().min(1, "名称不能为空").optional(),
  type: providerTypeSchema.optional(),
  capabilities: capabilitySchema.optional(),
  baseURL: z.string().url("请输入有效的 URL").optional(),
  apiKey: z.string().optional(),
  models: z.array(providerModelSchema).min(1, "至少添加一个图片模型").optional(),
  isEnabled: z.boolean().optional(),
});

function maskApiKey(value: string) {
  return value.length > 8 ? `${value.slice(0, 8)}****` : "****";
}

// GET /api/providers - 获取所有 Provider
export async function GET() {
  const allProviders = await db
    .select()
    .from(providers)
    .orderBy(desc(providers.createdAt));

  const safeProviders = allProviders.map((provider) => {
    try {
      return {
        ...provider,
        apiKey: maskApiKey(decrypt(provider.apiKey)),
      };
    } catch {
      return { ...provider, apiKey: "****" };
    }
  });

  return NextResponse.json(safeProviders);
}

// POST /api/providers - 创建 Provider
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = providerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  await db.insert(providers).values({
    id: nanoid(),
    name: data.name,
    type: data.type,
    capabilities: ["image"],
    baseURL: data.baseURL,
    apiKey: encrypt(data.apiKey.trim()),
    models: data.models.map((model) => ({ ...model, type: "image" })),
    isEnabled: data.isEnabled,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

// PUT /api/providers - 更新 Provider
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const parsed = providerUpdateSchema.safeParse(rest);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const nextApiKey = data.apiKey?.trim();
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };

  delete updateData.apiKey;

  if (data.capabilities) {
    updateData.capabilities = ["image"];
  }

  if (data.models) {
    updateData.models = data.models.map((model) => ({ ...model, type: "image" }));
  }

  if (nextApiKey) {
    updateData.apiKey = encrypt(nextApiKey);
  }

  await db.update(providers).set(updateData).where(eq(providers.id, id));

  return NextResponse.json({ success: true });
}

// DELETE /api/providers - 删除 Provider
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  await db.delete(providers).where(eq(providers.id, id));

  return NextResponse.json({ success: true });
}
