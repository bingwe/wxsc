#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { program } = require('commander');
const { version } = require('../package.json');
const { watchLessFile } = require('./watch');

program
  .version(version, '-v, --version')
  .option('-t, --type <language>', 'Listen to the preprocessing language and compiler it to WXSS.\nsupport language: less、sass、scss and stylus.', 'less')
  .action(source => {
    // 当前路径
    const currentPath = path.resolve();

    fs.stat(currentPath, err => {
      if (err) {
        console.log(chalk.red(err));

        process.exit(1);
      }

      const { type } = source;

      switch (type) {
        case 'less':
          watchLessFile(currentPath);
          break;
      
        default:
          break;
      }
    });
  })
  .parse(process.argv);
