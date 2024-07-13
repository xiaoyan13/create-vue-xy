import { parseArgs } from 'util';
import fs from 'fs';
import * as banners from './utils/banner';
import { red, yellow, green, bold } from 'kolorist';
import path from 'path';
import prompts from 'prompts';
import emptyDir from './utils/emptyDir';
import { isValidPackageName, toValidPackageName } from './utils/packageName';
import promptsJSON from './prompts/index.json';
import { renderTemplate } from './utils/renderTemplate';

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
/**
 * 我们一开始有一个 defaultProjectName,
 * 他的值取决于一开始用户传入的命令行参数是否为空
 */
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
  } catch (cancelled) {
    console.log(cancelled);
    process.exit(1);
  }

  // 我们从这里解构出来的是用户命令行交互的结果
  // 我们仍然需要将该结果与用户首次运行命令的时候传入的参数选项结合
  // 也就是说，解构的时候仍然需要对应的 argv 参数作为默认值
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
  // 目标目录
  const root = path.join(cwd, targetDir);

  console.log(`\n${promptsJSON.infos.scaffolding} ${root}...`);

  // 准备好空的文件夹，准备填充
  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }
  const pkg = { name: packageName, version: '0.0.0' };
  fs.writeFileSync(
    path.resolve(root, 'package.json'),
    JSON.stringify(pkg, null, 2),
  );

  // 渲染
  const templateRoot = path.resolve(cwd, 'template');
  const callbacks = [];

  const render = (templateName) => {
    const templateDir = path.resolve(templateRoot, templateName);
    renderTemplate(templateDir, root, callbacks);
  }

  // 首先渲染 template/base
  render('base')

  // 处理 axios 配置和 utils 配置
  if (!needsAxios) {
    
  }

  // 包管理器检测
  const userAgent = process.env.npm_config_user_agent ?? '';
  console.log("🚀 ~ setup ~ userAgent:", userAgent)
  const packageManager = /pnpm/.test(userAgent)
    ? 'pnpm'
    : /yarn/.test(userAgent)
      ? 'yarn'
      : /bun/.test(userAgent)
        ? 'bun'
        : 'npm';
  if (packageManager !== 'pnpm') {
    console.log(
      yellow('本项目使用 pnpm 作为包管理器: 请留意，您使用的并不是 pnpm.'),
    );
  }
  console.log(`\n${promptsJSON.infos.done}\n`);
  if (root !== cwd) {
    const cdProjString = path.relative(cwd, root);
    console.log(
      `  ${bold(
        green(
          `cd ${cdProjString.includes(' ') ? `"${cdProjString}"` : `${cdProjString}`}`,
        ),
      )}`,
    );
  }
  console.log(`  ${bold(green('pnpm i'))}`);
  console.log(`  ${bold(green('pnpm lint'))}`);
  console.log(`  ${bold(green('pnpm dev'))}`);
  console.log();
}

async function getResult() {
  const res = await prompts(
    [
      {
        name: 'projectName',
        // 如果已经通过命令行参数传入了，则不再需要输入 projectName
        // 反之，如果需要用户交互，则此时 defaultProjectName 为 'my-awesome-site'
        type: targetDir ? null : 'text',
        message: promptsJSON.projectName.message,
        initial: defaultProjectName,
        onState: (state) =>
          (targetDir = (String(state.value.trim()) || defaultProjectName)),
      },
      {
        name: 'shouldOverwrite',
        // 如果传参 --force 或者 targetDir 为空，则跳过
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
