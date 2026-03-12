# CCPro

CCPro 是一个基于 `Next.js 16 + Turso + Drizzle` 的 AI 漫画创作平台。
当前交付范围收口为 **Phase 1 纯图片生成 MVP**，包含：

- Provider 管理
- 图片生成工作台
- 作品画廊

不包含：

- 视频生成
- 漫画编辑器
- 导出 PNG / PDF
- 用户认证
- 社区与订阅能力

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 创建 `.env.local`

```bash
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

说明：
- `ENCRYPTION_KEY` 用于加密存储 Provider 的 `apiKey`
- `BLOB_READ_WRITE_TOKEN` 当前不是启动必需项

3. 执行数据库迁移

```bash
npx drizzle-kit migrate
```

4. 启动开发环境

```bash
npm run dev
```

5. 打开浏览器访问 `http://localhost:3000`

## 使用流程

### 1. 配置图片 Provider

进入 `Provider 设置` 页面，至少添加一个支持图片生成的 Provider。

目前支持：
- OpenAI 兼容接口
- Google Gemini 图片模型

每个 Provider 需要填写：
- 名称
- 类型
- API Endpoint
- API Key
- 模型列表

编辑已有 Provider 时，`API Key` 留空表示不修改原密钥。

### 2. 生成漫画图片

进入 `工作台` 页面：
- 选择 Provider 和模型
- 输入提示词 / 反向提示词
- 选择画面比例
- 点击“开始生成”

生成成功后会直接展示图片结果，并写入画廊。

### 3. 查看画廊

进入 `画廊` 页面：
- 查看最新生成的图片
- 查看生成状态
- 下载原始结果

## 校验命令

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 当前范围

已完成：
- Phase 1 主链路闭环
- Provider 管理
- 图片生成
- 画廊展示与下载

未纳入本轮：
- 漫画编辑器
- 导出 PNG / PDF
- 用户认证
- 社区与订阅
"# ccpro" 
