/**
 * 打包完成后发布到测试服务器
 */
let path = '/data/webs/shyd/dist';  //默认为测试服务器
const serverPath={
  // 'dev':'10.81.209.31',
  // 'test':'10.81.209.32',
  'dev':'10.81.204.79',
  'test':'10.81.209.34',
}
if(process.env.UMI_ENV === 'dev'){
  // path = '/home/smoreweb/dev/traffic/dist';
  path = '/data/webs/shyd/dist'
}
else if(process.env.UMI_ENV === 'test'){
  // path = '/home/smoreweb/uat/traffic/dist';
  path = '/data/webs/shyd/dist'
}
console.log('serverPath',process.env.UMI_ENV,process.env.NODE_ENV)
// 服务器配置
const serveConfig = {
  host:serverPath[process.env.UMI_ENV], // 服务器的IP地址
  port: '22', // 服务器端口， 一般为 22
  username: 'root', // 用户名
  // password:process.env.UMI_ENV==='test'?'Sm.ai@26':'smore@2023', // 密码
  password:process.env.UMI_ENV==='test'?'1qaz!QAZ12':'SMore@prod79', // 密码
  path // 项目部署的服务器目标位置
};
// 引入scp2
const client = require('scp2');
const ssh2Cliend = require('ssh2').Client;
const conn = new ssh2Cliend();
// 下面三个插件是部署的时候控制台美化所用 可有可无
const ora = require('ora');
const chalk = require('chalk');
const spinner = ora(chalk.green(`正在发布到${process.env.NODE_ENV}服务器...`));

async function upload() {
  spinner.start();
  client.scp('./dist/', serveConfig, (fail) => {
    spinner.stop();
    if (!fail) {
      // tslint:disable-next-line:no-console
      console.log('项目发布完成！');
    } else {
      // tslint:disable-next-line:no-console
      console.log('fail:', fail);
    }
  });
}

async function backup() {
  // conn.exec(`mv -fu ${serveConfig.path} ${serveConfig.path}.backup`, (e, mv) => {
  //  if (e) throw e;
  // mv.on('close', async () => {
  // tslint:disable-next-line:no-console
  // console.log('备份完成……');

  // 删除原目录
  conn.exec(`rm -rf ${serveConfig.path}`, async (err, stream) => {
    if (err) throw err;
    await upload();
    conn.end();
    // stream.on('close', async (code, signal) => {
    //   // 开始上传
    //   await upload();
    //   conn.end();
    // });
  });
  // });
  // });
}

conn
  .on('ready', async () => {
    // 先备份原文件
    await backup();
  })
  .connect({
    host: serveConfig.host,
    port: serveConfig.port,
    username: serveConfig.username,
    password: serveConfig.password
  });
