import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (fs.existsSync(envPath)) {
  console.log("[prepare-env] 已存在 .env，跳过复制");
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.log("[prepare-env] 未找到 .env.example，跳过复制");
  process.exit(0);
}

fs.copyFileSync(examplePath, envPath);
console.log("[prepare-env] 已从 .env.example 复制生成 .env");
console.log("[prepare-env] 注意：请确保其中不是示例占位值，而是真实可用的环境变量");
