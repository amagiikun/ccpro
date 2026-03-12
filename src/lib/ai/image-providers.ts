import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateImage } from "ai";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { providers } from "@/lib/db/schema";
import type { GenerateImageParams, ProviderConfig } from "./types";

function buildImageProvider(config: ProviderConfig) {
  switch (config.type) {
    case "openai-compatible":
      return createOpenAICompatible({
        name: config.id,
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
    case "google":
      return createGoogleGenerativeAI({
        apiKey: config.apiKey,
      });
    default:
      throw new Error(`Provider type "${config.type}" does not support image generation`);
  }
}

export async function generateImageFromProvider(params: GenerateImageParams) {
  const provider = await getDb().query.providers.findFirst({
    where: eq(providers.id, params.providerId),
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  if (!provider.isEnabled) {
    throw new Error("Provider is disabled");
  }

  const config: ProviderConfig = {
    ...provider,
    apiKey: decrypt(provider.apiKey),
  };

  const imageProvider = buildImageProvider(config);

  const model =
    config.type === "google"
      ? (imageProvider as ReturnType<typeof createGoogleGenerativeAI>).image(
          params.model
        )
      : (
          imageProvider as ReturnType<typeof createOpenAICompatible>
        ).imageModel(params.model);

  return generateImage({
    model,
    prompt: params.prompt,
    ...(params.size ? { size: params.size as `${number}x${number}` } : {}),
    ...(params.aspectRatio ? { aspectRatio: params.aspectRatio } : {}),
    ...(params.n ? { n: params.n } : {}),
  });
}
