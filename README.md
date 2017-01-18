# dependency-map
A mini project to write a file containing the dependencies for each file in a project
Dependency output will be based on the require calls for each file in the desired directory. 

####Output example: 

`JS/Main/foo -> JS/main/bar`

###To ge the dependency output in your project: 

* In `index.js` add the param in `processDirectory()` of the directory you wish to scan for dependencies. 

* To output a dependency file add `index.js` to your project and run `node index.js` to get the 
dependency output file `outputDependency.txt`.
 
* To get the map, copy the content produced from `outputDependency.txt` into [here](http://mdaines.github.io/viz.js/)
to get a dependency map / graph. 
