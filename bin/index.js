#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const shell = require('shelljs');
const chokidar = require('chokidar');
const less = require('less'); 

// 保存文件内容对应的md5值
const fileContentMD5 = new Map();

function convertExt(fpath) {
  return fpath.replace(/(.less|.sass|.scss|.stylus|.css)$/, '.wxss')
}

const argv = require('yargs')
  .option('w', {
    alias: 'watch',
    boolean: true,
    describe: '开启文件监听'
  })
  .usage('Usage: wx-style [options]')
  .example('wx-style -w', 'wx-style --watch')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2021')
  .argv;

if (argv.w) {
  // 当前路径
  const currentPath = path.resolve();

  // 查看当前文件夹状态
  fs.stat(currentPath, (err, stats) => {
    if (err) {
      shell.echo('\033[31m ' + err + ' \033[0m');
      process.exit(1);
    }

    shell.echo('\033[32m 正在监控less文件... \033[0m');

    chokidar.watch(`${currentPath}/**/*.less`).on('change', cpath => {
      const oldMD5 = fileContentMD5.get(cpath);
      const content = fs.readFileSync(cpath, 'utf-8');
      const newMD5 = crypto.createHash('md5').update(content).digest('hex')
      // 文件前后没有发生变化
      if (oldMD5 && oldMD5 === newMD5) return;

      // 将新的MD5值保存
      fileContentMD5.set(cpath, newMD5);

      // 文件发生变化进行编译处理
      shell.echo('正在编译...');

      less.render(content, {
        filename: cpath
      }).then(({ css, map, imports }) => {
        fs.writeFileSync(convertExt(cpath), css);
        shell.echo('编译成功');
      }).catch(err => {
        shell.echo('\033[31m ' + err + ' \033[0m');
      });
    });
  });
}
