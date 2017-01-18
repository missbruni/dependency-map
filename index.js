const fs = require('fs');
const path = require('path');
const resolve = require('path').resolve;

const flattenDeep = (arr) =>
  arr.reduce((agg, ele) => agg.concat(Array.isArray(ele) ? flattenDeep(ele) : [ele]), []);

const promisify = (func) =>
  (...args) =>
    new Promise((resolve, reject) =>
      func.apply(null, args.concat([(err, result) => err ? reject(err) : resolve(result)])));

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

const processDirectory = (directoryPath) =>
  readdir(directoryPath).then(files =>
    Promise.all(files.map(file => path.join(directoryPath, file))
      .map(filePath => stat(filePath)
        .then(stats => stats.isDirectory() ? processDirectory(filePath) : {filePath})
      ))
  );

processDirectory('JS') //change JS to the directory to be processed
  .then(flattenDeep)
  .then(files =>
    Promise.all(files.map(({filePath}) =>
      readfile(filePath, 'utf8')
        .then(content => ({
          filePath: filePath.split('.js')[0],
          requires: content.split('\n')
            .filter(line => line.includes('require(\'.'))
            .map(require => {
              const requiredPath = require.split('(\'')[1].split('\')')[0];
              return resolve(path.dirname(filePath), requiredPath).match(/JS(.*)/g)[0];
            })
        }))
    )))
  .then(dependencyList =>
    dependencyList.reduce((mappedDependencies, {filePath, requires}) => {
      mappedDependencies = mappedDependencies.concat(requires.map(require => `"${filePath}" -> "${require}"`));
      return mappedDependencies;
    }, []))
  .then(output => writeFile('outputDependency.txt', output.join('\n')))
  .catch(e => console.error(e));