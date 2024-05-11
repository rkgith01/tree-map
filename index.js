const url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const tooltip = d3.select("body").append("div").attr("id", "tooltip").style("opacity", 0);

const colors = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3.select("#container").append("svg").attr("width", 900).attr("height", 650);

const legend = d3.select("#legend");

const drawTreeMap = (data) => {
  const hierarchy = d3.hierarchy(data).sum((d) => d.value).sort((a, b) => b.value - a.value);

  const treemap = d3.treemap().size([800, 600]).padding(2); 

  treemap(hierarchy);

  const cells = svg.selectAll("g").data(hierarchy.leaves()).enter().append("g").attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  cells.append("rect")
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1   - d.x0) // || (d.x1 + 40)
    .attr("height", (d) => d.y1 - d.y0) // || (d.y1 + 40)
    .attr("fill", (d) => colors(d.data.category))
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`
      <p>Name: ${d.data.name}</p>
      <p>Category: ${d.data.category}</p>
      <p>${d.data.name}: $${d.data.value}M</p>`)
        .attr("data-value", d.data.value)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  cells.append("text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("class", "tile-text")
    .attr("x", 4)
    .attr("y", (d, i) => 10 + i * 12)
    .attr("dy", 12) 
    .style("font-size", "10px") 
    .text((d) => d);

  // Extract unique category names
  const uniqueCategories = [...new Set(hierarchy.leaves().map((d) => d.data.category))];

  // Append legend items directly with colored shapes
  const legendItems = legend.selectAll(".legend-item")
    .data(uniqueCategories)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => colors(d))
    .attr("transform", (d, i) => `translate(0, ${i * 25})`);

  // Append text to legend items
  legendItems.append("text")
    .text((d) => d)
    .attr("x", 25)
    .attr("y", 15)
    .attr("class", "legend-text")
    .style("font-size", "16px"); 
};

// Fetch data and draw tree map
fetch(url)
  .then((response) => response.json())
  .then((data) => {
    drawTreeMap(data);

    // If there are fewer than 2 categories, assign additional colors to legend items
    const uniqueCategories = [...new Set(data.children.map((d) => d.category))];
    if (uniqueCategories.length < 2) {
      const additionalColors = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueCategories);
      legend.selectAll(".legend-item").attr("fill", (d) => additionalColors(d));
    }
  });
