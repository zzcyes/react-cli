import path from "node:path";
import fs from "node:fs";
import { select } from "@inquirer/prompts";
import { exec } from "child_process";
import loading from "loading-cli";
import chalk from "chalk";
import templates from "./templates.json";

const { choices } = templates;

const commandCreate = async (projectName, cmd) => {
  const targetDir = path.join(process.cwd(), projectName);
  const exists = await fs.existsSync(targetDir);
  console.debug("targetDir", targetDir);

  if (cmd.force) {
    // 强制清除文件
    exists && (await fs.rmSync(targetDir, { recursive: true }));
  } else {
    if (exists) {
      // 存在文件夹提示错误 返回
      console.log(chalk.red("The " + projectName + " is exists"));
      return;
    }
  }

  const answers = await select({
    message: "请选择一个模板：",
    choices: choices,
  });

  const load = loading("模板下载中...").start();

  exec(`git clone ${answers} ${projectName}`, async (err) => {
    if (err) {
      load.fail("模板下载失败！");
      console.log(chalk.red("con't clone this repo, please try agin later!"));
      console.log(err);
      process.abort();
    }
    load.succeed("模板下载完成");
    load.start("模板创建中...");
    // 检查并修改 package.json 文件
    const packagePath = path.join(targetDir, "package.json");
    if (fs.existsSync(packagePath)) {
      try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
        packageData.name = projectName;
        fs.writeFileSync(
          packagePath,
          JSON.stringify(packageData, null, 2),
          "utf-8"
        );
        load.succeed("模板创建成功");
      } catch (error) {
        console.log(chalk.red("无法读取或写入 package.json 文件."));
        console.log(error);
        load.fail("模板创建失败");
      }
    }
  });
};

export default commandCreate;
