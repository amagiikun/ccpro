import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Provider 配置
export const providers = sqliteTable("providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["openai-compatible", "google"] }).notNull(),
  capabilities: text("capabilities", { mode: "json" })
    .notNull()
    .$type<Array<"image">>(),
  baseURL: text("base_url").notNull(),
  apiKey: text("api_key").notNull(),
  models: text("models", { mode: "json" })
    .notNull()
    .$type<Array<{ id: string; name: string; type: "image" }>>(),
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 生成记录（仅保留图片）
export const generations = sqliteTable("generations", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  providerId: text("provider_id")
    .notNull()
    .references(() => providers.id),
  model: text("model").notNull(),
  type: text("type", { enum: ["image"] }).notNull(),
  resultUrl: text("result_url"),
  thumbnailUrl: text("thumbnail_url"),
  parameters: text("parameters", { mode: "json" }).$type<Record<string, unknown>>(),
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 漫画项目
export const comics = sqliteTable("comics", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  layout: text("layout", { mode: "json" }).$type<Record<string, unknown>>(),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 漫画分镜
export const comicPanels = sqliteTable("comic_panels", {
  id: text("id").primaryKey(),
  comicId: text("comic_id")
    .notNull()
    .references(() => comics.id),
  generationId: text("generation_id").references(() => generations.id),
  order: integer("order").notNull(),
  posX: real("pos_x"),
  posY: real("pos_y"),
  width: real("width"),
  height: real("height"),
  dialogues: text("dialogues", { mode: "json" }).$type<
    Array<{ text: string; x: number; y: number; style?: string }>
  >(),
});

