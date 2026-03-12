export type ProviderType = "openai-compatible" | "google";

export type Capability = "image";

export const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;

export type AspectRatio = (typeof aspectRatios)[number];

export interface ModelConfig {
  id: string;
  name: string;
  type: "image";
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  capabilities: Capability[];
  baseURL: string;
  apiKey: string;
  models: ModelConfig[];
  isEnabled: boolean;
}

export interface GenerateImageParams {
  providerId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  size?: string;
  aspectRatio?: AspectRatio;
  n?: number;
}
