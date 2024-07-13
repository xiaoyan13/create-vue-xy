// async function asyncFunction() {
//   // 抛出错误，Promise 会被拒绝
//   throw new Error('This is a rejection');
// }

// asyncFunction()
//   .then((result) => {
//     console.log('Resolved:', result);
//   })
//   .catch((error) => {
//     console.error('Rejected:', error.message);
//   });

import fs from 'fs';
const cwd = process.cwd();
for (const file of fs.readdirSync(cwd)) {
  console.log(file);
}
