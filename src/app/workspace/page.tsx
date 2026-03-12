"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DownloadIcon,
  ImageIcon,
  LoaderIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aspectRatios, type AspectRatio } from "@/lib/ai/types";

interface ModelConfig {
  id: string;
  name: string;
  type: "image";
}

interface Provider {
  id: string;
  name: string;
  type: string;
  capabilities: Array<"image">;
  models: ModelConfig[];
  isEnabled: boolean;
}

const aspectRatioLabels: Record<AspectRatio, string> = {
  "1:1": "1:1 正方形",
  "16:9": "16:9 横屏",
  "9:16": "9:16 竖屏",
  "4:3": "4:3 标准",
  "3:4": "3:4 竖版",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function WorkspacePage() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await fetch("/api/providers");
      return response.json();
    },
  });

  const imageProviders = useMemo(
    () =>
      providers.filter(
        (provider) =>
          provider.isEnabled && provider.capabilities?.includes("image")
      ),
    [providers]
  );

  const activeProviderId = imageProviders.some(
    (provider) => provider.id === selectedProvider
  )
    ? selectedProvider
    : (imageProviders[0]?.id ?? "");

  const availableModels = useMemo(
    () =>
      imageProviders.find((provider) => provider.id === activeProviderId)?.models ?? [],
    [activeProviderId, imageProviders]
  );

  const activeModelId = availableModels.some((model) => model.id === selectedModel)
    ? selectedModel
    : (availableModels[0]?.id ?? "");

  const imageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: activeProviderId,
          model: activeModelId,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          aspectRatio,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "图片生成失败");
      }

      return payload;
    },
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      toast.success("图片生成成功");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "图片生成失败"));
    },
  });

  const canGenerate =
    prompt.trim().length > 0 && activeProviderId.length > 0 && activeModelId.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI 图片工作台</h1>
          <p className="text-sm text-muted-foreground">
            选择图片 Provider 与模型，输入提示词后直接生成漫画素材。
          </p>
        </div>
        <Link href="/settings/providers">
          <Button variant="outline">
            <SettingsIcon className="mr-2 h-4 w-4" />
            管理 Provider
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            正在加载 Provider...
          </CardContent>
        </Card>
      ) : !imageProviders.length ? (
        <Card>
          <CardHeader>
            <CardTitle>还没有可用的图片 Provider</CardTitle>
            <CardDescription>
              先到 Provider 设置页添加并启用至少一个图片 Provider。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/providers">
              <Button>
                <SettingsIcon className="mr-2 h-4 w-4" />
                前往配置
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>生成参数</CardTitle>
              <CardDescription>
                当前项目仅保留图片生成能力，视频生成链路已移除。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={activeProviderId}
                  onValueChange={(value) => setSelectedProvider(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择图片 Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>模型</Label>
                <Select
                  value={activeModelId}
                  onValueChange={(value) => setSelectedModel(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择图片模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>提示词</Label>
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="描述你想生成的漫画画面，例如角色、构图、镜头、风格与场景。"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>反向提示词</Label>
                <Input
                  value={negativePrompt}
                  onChange={(event) => setNegativePrompt(event.target.value)}
                  placeholder="可选，填写不希望出现的内容"
                />
              </div>

              <div className="space-y-2">
                <Label>画面比例</Label>
                <Select
                  value={aspectRatio}
                  onValueChange={(value) =>
                    setAspectRatio((value as AspectRatio | null) ?? "1:1")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio} value={ratio}>
                        {aspectRatioLabels[ratio]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!canGenerate || imageMutation.isPending}
                onClick={() => imageMutation.mutate()}
              >
                {imageMutation.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    开始生成
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
              <CardDescription>
                生成成功后会自动写入画廊，并支持直接下载图片。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="生成结果"
                    className="w-full rounded-xl border"
                  />
                  <a
                    href={generatedImage}
                    download="generated-image.png"
                    className="inline-flex h-9 w-full items-center justify-center rounded-md border text-sm hover:bg-muted"
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    下载图片
                  </a>
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground">
                  <ImageIcon className="mb-4 h-12 w-12 opacity-30" />
                  <p className="text-sm">生成成功后的图片会显示在这里。</p>
                  <p className="mt-1 text-xs">当前工作台只支持图片生成。</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
