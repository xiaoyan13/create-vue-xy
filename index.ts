import { parseArgs } from 'util';
import * as banners from './utils/banner';

async function init() {
  console.log();
  console.log(
    process.stdout.isTTY && process.stdout.getColorDepth() > 8
      ? banners.gradientBanner
      : banners.defaultBanner,
  );
  console.log();

  const cwd = process.cwd();
  const args = process.argv.slice(2);

  // 处理命令行参数
  const options = {
    axios: { type: 'boolean' },
    utils: { type: 'boolean' },
  } as const;
  const { values: argv, positionals } = parseArgs({
    args,
    options,
    strict: false,
  });
  const isFlagUsed = typeof (argv.axios ?? argv.utils) === 'boolean';
  const shouldOverwrite = argv.force;

  // 目标目录
  let targetDir = positionals[0];
  const defaultProjectName = targetDir ?? 'my-awesome-site';

  const prompts = require('./prompts/index.json');
}

init();
