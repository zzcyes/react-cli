const esbuild = require("esbuild");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 定义路径
const distDir = path.resolve(__dirname, "../dist");
const binDir = path.resolve(__dirname, "../bin");

// 清理 dist 和 bin 目录
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
if (fs.existsSync(binDir)) {
  fs.rmSync(binDir, { recursive: true });
}

// 编译 TypeScript 文件到 dist 目录
execSync("npx tsc");

// 使用 esbuild 打包并压缩输出到 bin 目录
esbuild.buildSync({
  entryPoints: [path.resolve(distDir, "index.js")],
  bundle: true,
  platform: "node",
  target: "node14",
  outfile: path.resolve(binDir, "cra-react-cli.min.js"),
  minify: true,
});

// 如果在非 Windows 平台，添加执行权限
if (process.platform !== "win32") {
  fs.chmodSync(path.resolve(binDir, "cra-react-cli.min.js"), "755");
}

// 在 bin 目录下创建一个执行文件，指向压缩后的文件
const binPath = path.resolve(binDir, "cli");
fs.writeFileSync(
  binPath,
  '#!/usr/bin/env node\nrequire("./cra-react-cli.min.js");'
);
fs.chmodSync(binPath, "755");

console.log("Build completed successfully.");
