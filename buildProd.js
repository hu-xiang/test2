const { exec } = require('child_process');

// const ssh2 = require("ssh2")

const compressing = require('compressing');

// 下面两个插件是部署的时候控制台美化所用 可有可无
const ora = require('ora');
const chalk = require('chalk');

//打包
const list = [
  'baseline',
  'boshilin',
  'changsha',
  // 'kunming',
  'luyuan',
  // 'meiping',
  // 'yancheng',
  // 'yidian',
  // 'zhongtie',
];

const script = 'pnpm build';

const spinner = ora(chalk.green(`正在打线上包...`));
spinner.start();

let num = 0;

list.forEach((item) => {
  // if (item === 'baseline') {
  //   exec('pnpm clean:dist');
  //   exec('pnpm clean:umi');
  // }
  let build = exec(`cd packages/${item} && ${script}`, item, (err) => {
    if (err) throw err;
  });
  // build.stdout.pipe(process.stdout)
  // build.stdout.on('data', (_chunk) => {

  //   // console.log(`${item} 正在打包...`)
  // })

  build.on('exit', () => {
    compress(item); //build完成后，执行压缩
  });
});

//压缩

function compress(item) {
  compressing.zip
    .compressDir(`packages/${item}/dist`, `front-packages/${item}/dist.zip`)

    .then(() => {
      num++;
      console.log(`${item} 打包成功!`);
      if (num === 4) {
        spinner.stop();
        num = 0;
      }
      // connect()
    })

    .catch((err) => {
      console.error(err);
    });
}

// var localPath = path.join(__dirname + "/vuedemo/dist.zip")   //本地项目打包路径

// var romotePath = "/var/www/html/dist.zip"                  //远程服务器部署路径

// //创建ssh链接

// let conn = new ssh2.Client();

// function connect() {

//   conn.on("ready", () => {

//     conn.sftp((err, sftp) => {

//       sftp.fastPut(localPath, romotePath, {}, (err, result) => {

//         if (err) throw err;

//         shell(conn)

//       })

//     })

//   }).connect({

//     host: 'xx.xx.xx.xx',   //远程服务IP地址

//     port: 22,

//     username: "root",

//     password: "root"

//   })

// }

// function shell(conn) {

//   conn.shell((err, stream) => {

//     stream.end(`

//             cd /var/www/html

//             mv dist bak/dist.$(date "+%Y%m%d%H%M%S").bak

//             unzip dist.zip

//             rm -rf dist.zip

//             exit

//         `).on("data", data => {

//       console.log(data.toString());

//     }).on("close", () => {

//       conn.end()

//     })

//   })

// }
