import fs from 'fs';
import { postOrderDirectoryTraverse } from './directoryTraverse';
export default function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file),
  );
}
