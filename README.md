# dependency-map 
###[LIVE DEMO](https://missbruni.github.io/dependency-map/tree.html)
A mini project to create a [d3 diagram](http://mbostock.github.io/d3/talk/20111018/tree.html) using a tree dependency layout based on a JSON file. Pretty cool, hu? 

###How can I get my project to look so awesome ?

* copy `json-generator.js` in the root of your cool project.

#####For now, a couple of changes need to be added manually to make this work:

* In `json-generator.js` add the param in `processDirectory()` of the directory you wish to scan for dependencies, please know this will only be scanning for `require` calls.

######Example
 
 ```
        processDirectory('src') 
            .then(flattenDeep)
            .then(files =>
 ```
 
 * Do the same here: 
 
```
        .then(output => {
            return {
            'name': 'src',
```
* On the CLI of your project root run `node json-generator.js` to get the `outputDependency.json` generated. 
You will find this file on your root folder.

* Copy the `outputDependency.json` back into the dependency-map project. 

* Open `tree.html` and you should have a beautiful, interactive and sleek dependency tree layout for your project. 
 
* if you wish to tidy your JSON you can tidy it up at this [JSON Formatter](https://jsonformatter.curiousconcept.com/).
