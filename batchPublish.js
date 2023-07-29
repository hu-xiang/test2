const { exec } = require('child_process');

//打包
const list = [
  'baseline',
  'boshilin',
  'changsha',
  'kunming',
  'luyuan',
  'meiping',
  'yancheng',
  'yidian',
  'zhongtie',
];

let publish = 'pnpm publish:dev';
if (process.env.UMI_ENV === 'dev') {
  console.log(`${process.env.UMI_ENV}环境，开始部署...`)
  publish = 'pnpm publish:dev';
}
else if (process.env.UMI_ENV === 'test') {
  console.log(`${process.env.UMI_ENV}环境，开始部署...`)
  publish = 'pnpm publish:test';
}

list.forEach((item) => {
  // exec('pnpm clean:dist');
  // exec('pnpm clean:umi');
  let build = exec(`cd packages/${item} && ${publish}`, null, (err) => {
    if (err) throw err;
  });

  build.on('exit', () => {
    console.log(`${item} 发布成功!`);
  });
});
