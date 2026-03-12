"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImageIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface ModelConfig {
  id: string;
  name: string;
  type: "image";
}

type ProviderType = "openai-compatible" | "google";

interface ProviderForm {
  name: string;
  type: ProviderType;
  capabilities: Array<"image">;
  baseURL: string;
  apiKey: string;
  models: ModelConfig[];
  isEnabled: boolean;
}

interface ProviderItem {
  id: string;
  name: string;
  type: ProviderType;
  capabilities: Array<"image">;
  baseURL: string;
  apiKey: string;
  models: ModelConfig[];
  isEnabled: boolean;
}

const providerTypeLabels: Record<ProviderType, string> = {
  "openai-compatible": "OpenAI 兼容",
  google: "Google Gemini",
};

const providerTypeDefaults: Record<ProviderType, { baseURL: string }> = {
  "openai-compatible": {
    baseURL: "https://api.openai.com/v1",
  },
  google: {
    baseURL: "https://generativelanguage.googleapis.com",
  },
};

const emptyForm: ProviderForm = {
  name: "",
  type: "openai-compatible",
  capabilities: ["image"],
  baseURL: providerTypeDefaults["openai-compatible"].baseURL,
  apiKey: "",
  models: [],
  isEnabled: true,
};

function formatErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return error.filter(Boolean).join("；");
  }

  if (error && typeof error === "object") {
    return Object.values(error)
      .flat()
      .filter(Boolean)
      .join("；");
  }

  return "请求失败";
}

export default function ProvidersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProviderForm>(emptyForm);
  const [newModelId, setNewModelId] = useState("");
  const [newModelName, setNewModelName] = useState("");

  const { data: providersList = [], isLoading } = useQuery<ProviderItem[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await fetch("/api/providers");
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ProviderForm & { id?: string }) => {
      const method = payload.id ? "PUT" : "POST";
      const trimmedApiKey = payload.apiKey.trim();
      const body = payload.id
        ? {
            id: payload.id,
            name: payload.name,
            type: payload.type,
            capabilities: ["image"],
            baseURL: payload.baseURL,
            models: payload.models.map((model) => ({ ...model, type: "image" })),
            isEnabled: payload.isEnabled,
            ...(trimmedApiKey ? { apiKey: trimmedApiKey } : {}),
          }
        : {
            name: payload.name,
            type: payload.type,
            capabilities: ["image"],
            baseURL: payload.baseURL,
            apiKey: trimmedApiKey,
            models: payload.models.map((model) => ({ ...model, type: "image" })),
            isEnabled: payload.isEnabled,
          };

      const response = await fetch("/api/providers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(formatErrorMessage(payload.error));
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setNewModelId("");
      setNewModelName("");
      toast.success(variables.id ? "Provider 已更新" : "Provider 已添加");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "保存失败");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/providers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider 已删除");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "删除失败");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const response = await fetch("/api/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isEnabled }),
      });

      if (!response.ok) {
        throw new Error("状态更新失败");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider 状态已更新");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "状态更新失败");
    },
  });

  function resetDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setNewModelId("");
    setNewModelName("");
  }

  function openCreateDialog() {
    resetDialog();
    setIsDialogOpen(true);
  }

  function openEditDialog(provider: ProviderItem) {
    setEditingId(provider.id);
    setForm({
      name: provider.name,
      type: provider.type,
      capabilities: ["image"],
      baseURL: provider.baseURL,
      apiKey: "",
      models: provider.models.map((model) => ({ ...model, type: "image" })),
      isEnabled: provider.isEnabled,
    });
    setNewModelId("");
    setNewModelName("");
    setIsDialogOpen(true);
  }

  function handleProviderTypeChange(type: ProviderType) {
    setForm((current) => ({
      ...current,
      type,
      capabilities: ["image"],
      baseURL: providerTypeDefaults[type].baseURL,
    }));
  }

  function addModel() {
    const id = newModelId.trim();
    const name = newModelName.trim();

    if (!id || !name) {
      return;
    }

    if (form.models.some((model) => model.id === id)) {
      toast.error("模型 ID 不能重复");
      return;
    }

    setForm((current) => ({
      ...current,
      models: [...current.models, { id, name, type: "image" }],
    }));
    setNewModelId("");
    setNewModelName("");
  }

  function removeModel(index: number) {
    setForm((current) => ({
      ...current,
      models: current.models.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function handleSave() {
    saveMutation.mutate({
      ...form,
      id: editingId ?? undefined,
      capabilities: ["image"],
      models: form.models.map((model) => ({ ...model, type: "image" })),
    });
  }

  const saveDisabled =
    saveMutation.isPending ||
    !form.name.trim() ||
    !form.baseURL.trim() ||
    (!editingId && !form.apiKey.trim()) ||
    form.models.length === 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider 设置</h1>
          <p className="text-sm text-muted-foreground">
            当前项目只保留图片 Provider 与图片模型配置。
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          添加 Provider
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            正在加载 Provider...
          </CardContent>
        </Card>
      ) : providersList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">还没有配置图片 Provider</p>
              <p className="text-sm text-muted-foreground">
                先添加一个可用的图片 Provider，工作台才能开始生成图片。
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <PlusIcon className="mr-2 h-4 w-4" />
              立即添加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {providersList.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle>{provider.name}</CardTitle>
                    <CardDescription className="break-all">
                      {provider.baseURL}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{providerTypeLabels[provider.type]}</Badge>
                      <Badge variant="secondary">图片</Badge>
                      <Badge variant={provider.isEnabled ? "default" : "outline"}>
                        {provider.isEnabled ? "已启用" : "已停用"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => openEditDialog(provider)}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => deleteMutation.mutate(provider.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">已配置模型</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map((model) => (
                      <Badge key={model.id} variant="outline">
                        {model.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">启用状态</p>
                    <p className="text-xs text-muted-foreground">
                      API Key：{provider.apiKey}
                    </p>
                  </div>
                  <Switch
                    checked={provider.isEnabled}
                    onCheckedChange={() =>
                      toggleMutation.mutate({
                        id: provider.id,
                        isEnabled: !provider.isEnabled,
                      })
                    }
                    disabled={toggleMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑 Provider" : "添加 Provider"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>名称</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="例如：Gemini 图片"
                />
              </div>

              <div className="space-y-2">
                <Label>Provider 类型</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    handleProviderTypeChange(
                      (value as ProviderType | null) ?? "openai-compatible"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(providerTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input
                  value={form.baseURL}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, baseURL: event.target.value }))
                  }
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={form.apiKey}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, apiKey: event.target.value }))
                  }
                  placeholder={editingId ? "留空表示不修改" : "sk-..."}
                />
              </div>
            </div>

            <div className="rounded-lg border px-4 py-3">
              <p className="text-sm font-medium">当前能力</p>
              <p className="mt-1 text-sm text-muted-foreground">
                本项目仅支持图片生成，视频能力已从配置和接口中移除。
              </p>
              <div className="mt-3 flex gap-2">
                <Badge variant="secondary">图片</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label className="mb-2 block">模型列表</Label>
                <p className="text-sm text-muted-foreground">
                  为当前 Provider 维护可选的图片模型。
                </p>
              </div>

              {form.models.length > 0 && (
                <div className="space-y-2">
                  {form.models.map((model, index) => (
                    <div
                      key={`${model.id}-${index}`}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <span className="flex-1 font-mono">{model.id}</span>
                      <span className="text-muted-foreground">{model.name}</span>
                      <Badge variant="outline">图片</Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeModel(index)}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={newModelId}
                  onChange={(event) => setNewModelId(event.target.value)}
                  placeholder="模型 ID，例如 gpt-image-1"
                />
                <Input
                  value={newModelName}
                  onChange={(event) => setNewModelName(event.target.value)}
                  placeholder="显示名称"
                />
                <Button
                  variant="outline"
                  onClick={addModel}
                  disabled={!newModelId.trim() || !newModelName.trim()}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  添加模型
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saveDisabled}>
              {saveMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
