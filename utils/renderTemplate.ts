import path from 'path';
import fs from 'fs';

/**
 *  `_filename` 被重命名为 `.filename`
 *  `package.json` 下的目录会被递归合并
 * @param {string} src 将要拷贝的目录
 * @param {string} dest 目标目录
 */
export function renderTemplate(src, dest, callbacks) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    // node_modules
    if (path.basename(src) === 'node_modules')
        return 
    fs.mkdirSync(dest, {recursive: true})
  }
}
