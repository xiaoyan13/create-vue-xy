import path from 'path';
import fs from 'fs';
import sortDependencies from './sortDependencies';
import deepMerge from './deepMerge';
import { pathToFileURL } from 'url';

/**
 *  `package.json` 下会被递归合并
 *  `.git` 将被忽略
 *  其他文件会被覆盖
 * @param {string} src 将要被拷贝的目录
 * @param {string} dest 目标目录
 */
export function renderTemplate(src, dest, callbacks) {
  // 我们不需要拷贝源仓库的 git 历史记录
  if (path.basename(src) === '.git') return;

  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });

    for (const file of fs.readdirSync(src)) {
      renderTemplate(
        path.resolve(src, file),
        path.resolve(dest, file),
        callbacks,
      );
    }
    return;
  }

  const filename = path.basename(src);

  // 合并 package.json
  if (filename === 'package.json' && fs.readFileSync(dest)) {
    const existing = JSON.parse(fs.readFileSync(dest, 'utf8'));
    const news = JSON.parse(fs.readFileSync(src, 'utf8'));
    const pkg = sortDependencies(deepMerge(existing, news));
    fs.writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n');
    return;
  }

  // 处理 ejs 模板的 .data.mjs
  if (filename.endsWith('.data.mjs')) {
    dest = dest.replace(/\.data.mjs$/, '');

    callbacks.push(async (dataStore) => {
      const getData = (await import(pathToFileURL(src).toString())).default;

      dataStore[dest] = await getData({
        oldData: dataStore[dest] || {},
      });
    });
  }

  //  其他普通文件：直接拷贝覆盖
  fs.copyFileSync(src, dest);
}
