import fs from 'node:fs';
import path from 'node:path';

export function preOrderDirectoryTraverse(dir, dirCb, fileCb) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      continue;
    }
    const fullpath = path.resolve(dir, filename);
    if (fs.lstatSync(fullpath).isDirectory()) {
      dirCb(fullpath);
      fs.existsSync(fullpath) &&
        preOrderDirectoryTraverse(fullpath, dirCb, fileCb);
    } else {
      fileCb(fullpath);
    }
  }
}

export function postOrderDirectoryTraverse(dir, dirCb, fileCb) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      continue;
    }
    const fullpath = path.resolve(dir, filename);
    if (fs.lstatSync(fullpath).isDirectory()) {
      postOrderDirectoryTraverse(fullpath, dirCb, fileCb);
      dirCb(fullpath);
    } else {
      fileCb(fullpath);
    }
  }
}
