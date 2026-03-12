"use client";

/* eslint-disable @next/next/no-img-element */

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  ImageIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Generation {
  id: string;
  prompt: string;
  type: "image";
  status: "pending" | "processing" | "completed" | "failed";
  resultUrl: string | null;
  model: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: Generation["status"] }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircleIcon className="mr-1 h-3 w-3" />
          已完成
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary">
          <ClockIcon className="mr-1 h-3 w-3" />
          生成中
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircleIcon className="mr-1 h-3 w-3" />
          失败
        </Badge>
      );
    default:
      return <Badge variant="outline">等待中</Badge>;
  }
}

export default function GalleryPage() {
  const { data: items = [], isLoading } = useQuery<Generation[]>({
    queryKey: ["generations"],
    queryFn: async () => {
      const response = await fetch("/api/generations");
      return response.json();
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold">图片画廊</h1>
        <p className="text-sm text-muted-foreground">
          这里展示最近生成的漫画图片结果，支持查看状态与直接下载。
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">正在加载图片记录...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">还没有生成记录</p>
              <p className="text-sm text-muted-foreground">
                去工作台创建第一张漫画图片后，这里会自动出现。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {item.status === "completed" && item.resultUrl ? (
                  <img
                    src={item.resultUrl}
                    alt={item.prompt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                <div className="absolute right-2 top-2">
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <CardContent className="space-y-3 p-3">
                <p className="line-clamp-2 text-sm leading-6">{item.prompt}</p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="max-w-[70%] truncate text-xs">
                    {item.model}
                  </Badge>
                  {item.status === "completed" && item.resultUrl && (
                    <a
                      href={item.resultUrl}
                      download={`${item.id}.png`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
                    >
                      <DownloadIcon className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
