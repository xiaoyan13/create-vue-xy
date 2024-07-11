import esbuild from 'esbuild';

await esbuild.build({
  // 开启打包
  bundle: true,
  // 目标文件的格式, 名称
  format: 'cjs',
  outfile: 'outfile.cjs',
  target: 'node16',
  // 目标运行环境
  platform: 'node',
  // 入口
  entryPoints: ['index.ts'],
});
