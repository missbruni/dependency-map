const fs = require('fs');
const path = require('path');
const resolve = require('path').resolve;

const flattenDeep = (arr) =>
  arr.reduce((agg, ele) => agg.concat(Array.isArray(ele) ? flattenDeep(ele) : [ele]), []);

const promisify = (func) =>
  (...args) =>
    new Promise((resolve, reject) =>
      func.apply(null, args.concat([(err, result) => err ? reject(err) : resolve(result)])));

const copyFile = (from, to) => 
  new Promise((resolve, reject) => 
    fs.createReadStream(from).pipe(fs.createWriteStream(to)).on('finish', () => resolve).on('error', err => reject(err))
  )  

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

const processDirectory = (directoryPath) =>
  readdir(directoryPath).then(files =>
    Promise.all(files.map(file => path.join(directoryPath, file))
      .map(filePath => stat(filePath)
        .then(stats => stats.isDirectory() ? processDirectory(filePath) : {filePath})
      ))
  );

const processDependency = (pathToScan, targetDir) => {
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
  .then(outputDependency => 
     mkdir(targetDir).catch(err => err.code === 'EEXIST' ? true : console(err))
    .then(writeFile(targetDir + '/outputDependency.json', JSON.stringify(outputDependency)))
    .then(() => 
      Promise.all([
        copyFile(path.join(__dirname, 'tree.js'), path.join(targetDir, 'tree.js')),
        copyFile(path.join(__dirname, 'index.html'), path.join(targetDir, 'index.html')),
        copyFile(path.join(__dirname, 'style.css'), path.join(targetDir, 'style.css')),
        copyFile(path.join(__dirname, 'texture-noise.png'), path.join(targetDir, 'texture-noise.png'))
      ])
    )
    .catch(e => console.error(e))
  )
};

module.exports = processDependency;
