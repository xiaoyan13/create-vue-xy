import { parseArgs } from 'util';
import fs from 'fs';
import * as banners from './utils/banner';
import { red } from 'kolorist';
import path from 'path';
import prompts from 'prompts';
import type { Prompts } from './prompts/types';
import emptyDir from './utils/emptyDir';
import { isValidPackageName, toValidPackageName } from './utils/packageName';
// const promptsJSON = require('./prompts/index.json') as Prompts;
import promptsJSON from './prompts/index.json';

// 处理命令行参数
const args = process.argv.slice(2);
const options = {
  axios: { type: 'boolean' },
  utils: { type: 'boolean' },
  'vue-devtools': { type: 'boolean' },
  devtools: { type: 'boolean' },
} as const;
const { values: argv, positionals } = parseArgs({
  args,
  options,
  strict: false,
});
/**
 * 方便起见，如果 isFlagUsed 为 true，我们将在下面的交互中跳过 _所有_ 可选的安装选项
 * 这意味着只要用户通过命令行传参的方式指定了一个安装项，那么接下来的交互就不会出现任何安装项提供选择
 */
const isFlagUsed: boolean =
  typeof (
    argv.axios ??
    argv.utils ??
    (argv.devtools || argv['vue-devtools'])
  ) === 'boolean';
/**
 * 方便起见，将仅处理接收 _相对路径_ 作为 targetDir
 * 这意味着用户如果使用命令行参数，将只能传入相对路径
 */
let targetDir = positionals[0];
// 如果目标目录存在，则将它的名字作为默认的项目名称
const defaultProjectName = targetDir ?? 'my-awesome-site';

async function setup() {
  console.log();
  console.log(
    process.stdout.isTTY && process.stdout.getColorDepth() > 8
      ? banners.gradientBanner
      : banners.defaultBanner,
  );
  console.log();

  let result: {
    projectName?: string;
    shouldOverwrite?: string;
    packageName?: string;
    needsAxios?: boolean;
    needsUtils?: boolean;
    needsDevTools?: boolean;
  } = {};

  try {
    result = await getResult();
    console.log('🚀 ~ setup ~ result:', result);
  } catch (cancelled) {
    console.log(cancelled);
    process.exit(1);
  }

  const {
    projectName,
    // 包名如果解构不出，则默认值取 projectName
    packageName = projectName,
    shouldOverwrite = argv.force,
    needsAxios = argv.axios,
    needsUtils = argv.utils,
    needsDevTools = argv.devtools || argv['vue-devtools'],
  } = result;

  const cwd = process.cwd();
  const root = path.join(cwd, targetDir);
  // 准备好空的文件夹，准备填充
  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  console.log(`\n${promptsJSON.infos.scaffolding} ${root}...`);
}

async function getResult() {
  const res = await prompts(
    [
      {
        name: 'projectName',
        type: targetDir ? null : 'text',
        message: promptsJSON.projectName.message,
        initial: defaultProjectName,
        onState: (state) =>
          (targetDir = String(state.value.trim()) || defaultProjectName),
      },
      {
        name: 'shouldOverwrite',
        // 如果传参 --force 或者该目录本就不存在，则跳过
        type: () => (argv.force || !fs.existsSync(targetDir) ? null : 'toggle'),
        message: () => {
          // 我们判断目标目录是否是 '.' 来拼接将要打印的内容
          const prompt =
            targetDir === '.'
              ? promptsJSON.shouldOverwrite.dirForPrompts.current
              : `${promptsJSON.shouldOverwrite.dirForPrompts.target} "${targetDir}"`;

          return `${prompt} ${promptsJSON.shouldOverwrite.message}`;
        },
        initial: true,
        active: promptsJSON.defaultToggleOptions.active,
        inactive: promptsJSON.defaultToggleOptions.inactive,
        format: (val) => {
          // 回车后，拿到 val，我们判断是否是 false. 如果为 false, 则直接终止程序
          if (val === false)
            throw new Error(
              red('✖') + ` ${promptsJSON.errors.operationCancelled}`,
            );
          return val;
        },
      },
      {
        name: 'packageName',
        // 如果 targetDir 可以作为 packageName 则跳过
        type: () => (isValidPackageName(targetDir) ? null : 'text'),
        message: promptsJSON.projectName.message,
        initial: () => toValidPackageName(targetDir),
        validate: (dir) =>
          isValidPackageName(dir) || promptsJSON.packageName.invalidMessage,
      },
      {
        name: 'needsAxios',
        type: () => (isFlagUsed ? null : 'toggle'),
        message: promptsJSON.needsAxios.message,
        initial: true,
        active: promptsJSON.defaultToggleOptions.active,
        inactive: promptsJSON.defaultToggleOptions.inactive,
      },
      {
        name: 'needsUtils',
        type: () => (isFlagUsed ? null : 'toggle'),
        message: promptsJSON.needsUtils.message,
        initial: true,
        active: promptsJSON.defaultToggleOptions.active,
        inactive: promptsJSON.defaultToggleOptions.inactive,
      },
      {
        name: 'needsDevTools',
        type: () => (isFlagUsed ? null : 'toggle'),
        message: promptsJSON.needsDevTools.message,
        initial: false,
        active: promptsJSON.defaultToggleOptions.active,
        inactive: promptsJSON.defaultToggleOptions.inactive,
      },
    ],
    {
      onCancel: () => {
        throw new Error(red('✖' + `${promptsJSON.errors.operationCancelled}`));
      },
    },
  );

  return res;
}

setup().catch((err) => {
  console.error(err);
});
