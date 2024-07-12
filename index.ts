import { parseArgs } from 'util';
import fs from 'fs';
import * as banners from './utils/banner';
import { red } from 'kolorist';
import prompts from 'prompts';
import type { Prompts } from './prompts/types';
import { isValidPackageName, toValidPackageName } from './utils/packageName';

/**
 * 方便起见，将仅处理接收 _相对路径_ 作为 targetDir
 * 这意味着用户如果使用命令行参数，将只能传入相对路径
 */
let targetDir = null;
let defaultProjectName = null;

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
    needAxios?: boolean;
    needUtils?: boolean;
    needDevTools?: boolean;
  } = {};

  try {
    result = await getResult();
  } catch (cancelled) {
    console.log(cancelled.message);
    process.exit(1);
  }
}

async function getResult() {
  // 处理命令行参数
  const args = process.argv.slice(2);
  const options = {
    axios: { type: 'boolean' },
    utils: { type: 'boolean' },
    'vue-devtools': { type: 'boolean' },
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

  // 目标目录
  targetDir = positionals[0];
  defaultProjectName = targetDir ?? 'my-awesome-site';

  const promptsJSON = require('./prompts/index.json') as Prompts;

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
          // 回车后，拿到 val，我们判断是否是 false
          if (val === false)
            throw new Error(
              red('✖') + ` ${promptsJSON.errors.operationCancelled}`,
            );
          return val;
        },
      },
      {
        name: 'packageName',
        type: () => (isValidPackageName(targetDir) ? null : 'text'),
        message: promptsJSON.projectName.message,
        initial: () => toValidPackageName(targetDir),
        validate: (dir) =>
          isValidPackageName(dir) || promptsJSON.packageName.invalidMessage,
      },
      {
        name: 'needAxios',
        type: () => (isFlagUsed ? null : 'toggle'),
        message: promptsJSON.needsAxios.message,
        initial: true,
        active: promptsJSON.defaultToggleOptions.active,
        inactive: promptsJSON.defaultToggleOptions.inactive,
      },
      {
        name: 'needUtils',
        type: () => (isFlagUsed ? null : 'toggle'),
        message: promptsJSON.needsUtils.message,
        initial: true,
        active: promptsJSON.defaultToggleOptions.active,
        inactive: promptsJSON.defaultToggleOptions.inactive,
      },
      {
        name: 'needDevTools',
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
