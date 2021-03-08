const chalk = require('chalk');
const crypto = require('crypto');
const fs = require('fs');
const chokidar = require('chokidar');
const less = require('less');

// 保存文件内容对应的md5值
const fileContentMD5 = new Map();

function convertExt(fpath) {
  return fpath.replace(/(.less|.sass|.scss|.stylus|.css)$/, '.wxss')
}

// 监听less文件
function watchLessFile (currentPath) {
  console.log(chalk.blue.bgGreenBright`正在监听less文件...`);

  chokidar.watch(`${currentPath}/**/*.less`).on('change', cpath => {
    const oldMD5 = fileContentMD5.get(cpath);
    const content = fs.readFileSync(cpath, 'utf-8');
    const newMD5 = crypto.createHash('md5').update(content).digest('hex')
    // 文件前后没有发生变化
    if (oldMD5 && oldMD5 === newMD5) return;

    // 将新的MD5值保存
    fileContentMD5.set(cpath, newMD5);

    // 文件发生变化进行编译处理
    console.log(chalk.yellow(`正在编译: ${cpath}`));

    less.render(content, {
      filename: cpath
    }).then(({ css, map, imports }) => {
      fs.writeFileSync(convertExt(cpath), css);
      console.log(chalk.blueBright('编译成功'));
    }).catch(err => {
      console.log(chalk.red(err));
    });
  });
}

module.exports = {
  watchLessFile
}