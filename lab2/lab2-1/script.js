// Function to generate random dataset
function generateRandomDataset(size) {
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Edward",
    "Fiona",
    "George",
    "Hannah",
    "Ivan",
    "Julia",
  ];
  const eyeColors = ["blue", "green", "brown", "hazel", "gray"];

  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomAge() {
    return Math.floor(Math.random() * 101); // Age between 0 and 100
  }

  function getRandomScore() {
    return Math.floor(Math.random() * 101); // Score between 0 and 100
  }

  return Array.from({ length: size }, (_, i) => ({
    id: i,
    name: getRandomElement(names),
    age: getRandomAge(),
    score: getRandomScore(),
    eyeColor: getRandomElement(eyeColors),
  }));
}

const dataset = generateRandomDataset(20);

const margin = { top: 80, right: 80, bottom: 80, left: 80 };
const width = 1000 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

const svg1 = d3
  .select("#viz1")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


svg1
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "#f5f5f5");

const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
const fontSizeScale = d3.scaleLinear().domain([0, 100]).range([10, 22]); 

const xAxis = d3.axisBottom(xScale).ticks(10);
const yAxis = d3.axisLeft(yScale).ticks(10);

svg1
  .append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis)
  .append("text")
  .attr("x", width / 2)
  .attr("y", 50) 
  .attr("fill", "black")
  .style("text-anchor", "middle")
  .style("font-size", "18px") 
  .text("Age");

svg1
  .append("g")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -60) 
  .attr("fill", "black")
  .style("text-anchor", "middle")
  .style("font-size", "18px") 
  .text("Score");

  svg1
  .selectAll("text.name-label")
  .data(dataset)
  .enter()
  .append("text")
  .attr("class", "name-label")
  .attr("x", (d) => xScale(d.age))
  .attr("y", (d) => yScale(d.score))
  .attr("dy", "0em") 
  .text((d) => d.name)
  .style("font-size", (d) => `${fontSizeScale(d.age)}px`)
  .style("fill", (d) => d.eyeColor)
  .style("text-anchor", "middle")
  .style("cursor", "pointer")
  .on("mouseover", function (event, d) {
    highlightSingleData(d);
  })
  .on("mouseout", function () {
    resetHighlights();
  });


const list = d3.select("#viz2").append("ul")
  .style("list-style-type", "none")
  .style("padding", "0")
  .style("margin", "0")
  .style("font-size", "16px") 
  .style("line-height", "1.8em"); 

list
  .selectAll("li")
  .data(dataset)
  .enter()
  .append("li")
  .attr("id", (d) => `item-${d.id}`)
  .style("cursor", "pointer")
  .style("padding", "5px 10px")
  .style("border-bottom", "1px solid #ddd")
  .text((d) => `Ime: ${d.name}, Dob: ${d.age}, Rezultat: ${d.score}, Boja očiju: ${d.eyeColor}`)
  .on("mouseover", function (event, d) {
    highlightSingleData(d);
  })
  .on("mouseout", function () {
    resetHighlights();
  });


function highlightSingleData(data) {
  svg1
    .selectAll("text.name-label")
    .style("font-weight", (d) => (d.id === data.id ? "bold" : "normal"))
    .style("font-size", (d) => (d.id === data.id ? `${fontSizeScale(d.age) * 1.2}px` : `${fontSizeScale(d.age)}px`));
  list
    .selectAll("li")
    .style("background-color", (d) => (d.id === data.id ? "#f0f0f0" : "transparent"))
    .style("font-weight", (d) => (d.id === data.id ? "bold" : "normal"));
}

function resetHighlights() {
  svg1
    .selectAll("text.name-label")
    .style("font-weight", "normal")
    .style("font-size", (d) => `${fontSizeScale(d.age)}px`);

  list
    .selectAll("li")
    .style("background-color", "transparent")
    .style("font-weight", "normal");
}