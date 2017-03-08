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

const processDependency = (pathToScan) => {
  return processDirectory(pathToScan) //change to the directory to be scanned
  .then(flattenDeep)
  .then(files =>
    Promise.all(files.map(({filePath}) =>
      readfile(filePath, 'utf8')
        .then(content => ({
          'name': filePath.split('.js')[0],
          'children': content.split('\n')
            .filter(line => line.includes('require(\'.'))
            .map(require => {
              const requiredPath = require.split('(\'')[1].split('\')')[0];
              return resolve(path.dirname(filePath), requiredPath).match(/JS(.*)/g)[0];
            })
        }))
    )))
  .then(output => output.filter(ele => ele.children.length > 0))
  .then(output => output.map(ele => {
    ele.children = ele.children.map(requireToMap => {
      return { name: requireToMap };
    });
    return ele;
  }))
  .then(output => {
    return {
      'name': pathToScan,
      'children': output
    }
  })
  .then(outputDependency => writeFile('outputDependency.json', JSON.stringify(outputDependency)))
  .catch(e => console.error(e));
};

module.exports = processDependency;
