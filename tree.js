var m = [120, 200, 120, 200],
  w = 5000 - m[1] - m[3],
  h = 1000 - m[0] - m[2],
  i = 0,
  root;

var tree = d3.layout.tree()
  .size([h, w]);

var diagonal = d3.svg.diagonal()
  .projection(d => [d.y, d.x]);

var vis = d3.select("#body").append("svg:svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .append("svg:g")
  .attr("transform", `translate(${m[3]}, ${m[0]})`);

d3.json("outputDependency.json", json => {
  root = json;
  root.x0 = h / 2;
  root.y0 = 0;

  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  // Initialize the display to show a few nodes.
  root.children.forEach(toggleAll);

  update(root);
});

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root);

  // Normalize for fixed-depth.
  nodes.forEach(d => { d.y = d.depth * 410; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
    .data(nodes, d => d.id || (d.id = ++i));

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", d => "translate(" + source.y0 + "," + source.x0 + ")")
    .on("click", d => { toggle(d); update(d); });

  nodeEnter.append("svg:circle")
    .attr("r", 1e-6)
    .style("fill", d => d._children ? "#6db169" : "#fff");

  nodeEnter.append("svg:text")
    .attr("x", d => d.children || d._children ? -10 : 10)
    .attr("dy", ".35em")
    .attr("text-anchor", d => d.children || d._children ? "end" : "start")
    .text(d => d.name)
    .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", d => `translate(${d.y},${d.x})`);

  nodeUpdate.select("circle")
    .attr("r", 4.5)
    .style("fill", d => d._children ? "#6db169" : "#fff");

  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", d => `translate(${source.y},${source.x})`)
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
    .data(tree.links(nodes), d => d.target.id);

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
    .attr("class", "link")
    .attr("d", d => {
      var o = {x: source.x0, y: source.y0};
      return diagonal({source: o, target: o});
    })
    .transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", d => {
      var o = {x: source.x, y: source.y};
      return diagonal({source: o, target: o});
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}