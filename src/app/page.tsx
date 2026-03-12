import Link from "next/link";
import {
  ImageIcon,
  LayoutGridIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <SparklesIcon className="h-6 w-6 text-primary" />
          CCPro
        </div>
        <Link href="/workspace">
          <Button>进入工作台</Button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI 漫画图片创作平台
          </h1>
          <p className="text-lg text-muted-foreground">
            当前聚焦 Phase 1 纯图片主链路，支持图片 Provider 管理、漫画素材生成与画廊浏览。
          </p>
          <Link href="/workspace">
            <Button size="lg" className="mt-4">
              <SparklesIcon className="mr-2 h-4 w-4" />
              开始创作
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                图片生成
              </CardTitle>
              <CardDescription>
                生成角色设定图、封面图和漫画分镜草图。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutGridIcon className="h-5 w-5 text-purple-500" />
                图片画廊
              </CardTitle>
              <CardDescription>
                集中查看最近生成的图片结果，并支持直接下载。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SettingsIcon className="h-5 w-5 text-green-500" />
                Provider 管理
              </CardTitle>
              <CardDescription>
                自由维护多个图片 Provider，并配置可用模型列表。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
