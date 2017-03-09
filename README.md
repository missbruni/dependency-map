# require-dependency-map 
###[LIVE DEMO](https://missbruni.github.io/require-dependency-map/tree.html)
Create a [d3 diagram](http://mbostock.github.io/d3/talk/20111018/tree.html) using a tree dependency layout based on a JSON file. 
Pretty cool, hu? 

###How can I get my project to look so awesome ?

```
npm install require-dependency-map
```

### Example using a grunt task:

```
const processDependency = require('require-dependency-map');
const sourceDir = 'src'
const targetDir = 'dependency-map'

module.exports = (grunt) => 
  grunt.task.registerTask('outputDependency', 'outputs dependency d3 dir', function () { 
      const done = this.async();

      processDependency(sourceDir, targetDir)
      .then(() => done())
      .catch(e => console.error(e)); 
  });
```

This task will generate a folder in the root:

```
- root
  - src
  - style
  - test
  - dependency-map
     - index.js
     - tree.js
     - style.css
     - index.html
     - outputDependency.json
```

Open index.html and enjoy your interactive dependency map.

