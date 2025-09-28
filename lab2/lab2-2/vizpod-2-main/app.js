const nodePadding = 0.1;

let croatia = null;
let municipalities = null;
let populationData = null;
let populations = null;
let votingData = null;
let jlsData = null;
let promises = [];
let radiusScale = null;

let width = document.getElementById("map").clientWidth;

// cap with to 1200:
width = width > 1200 ? 1200 : width;

let height = document.getElementById("map").clientHeight;
let color = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

let projection = null;
let path = null;
let svg = null;

let izbori2025 = null;

promises.push(d3.json("hrvatska.topo.json"));
promises.push(d3.csv("stanovnistvo_povrsina.csv"));
// promises.push(d3.json("izbori2020.json"));
promises.push(d3.csv("jls.csv", d3.autoType));
promises.push(d3.json("combined.json"));

//fetch all files:
Promise.all(promises).then(function (data) {
  croatia = data[0];
  populationData = data[1];
  // let electionDataRaw = data[2];
  jlsData = data[2];
  izbori2025 = data[3];

  // console.log(electionDataRaw);
  // console.log(izbori2025);

  votingData = izbori2025.map((d) => {
    return {
      zupNaziv: d.zupNaziv,
      gropNaziv: d.gropNaziv,
      count: d.lista.reduce(
        (accumulator, currentValue) =>
          accumulator.glasova + currentValue.glasova
      ),
      primorac: d.lista.find((d) => d.jedinstvenaSifra == 2).glasova,
      milanovic: d.lista.find((d) => d.jedinstvenaSifra == 1).glasova,
    };
  });

  populations = new Array();
  croatia.objects.hrvatska.geometries.forEach((opcina) => {
    let opcinaFound = populationData.find(
      (d) => d.Name.toUpperCase() == opcina.properties.NAME_2.toUpperCase()
    );

    populations.push({
      id: opcina.properties.ID_2,
      name: opcina.properties.NAME_2,
      // zup_name: opcina.properties.NAME_1,
      found: opcinaFound ? true : false,
      population: opcinaFound ? +opcinaFound.Population : 0,
    });
  });

  wrangleData();
});

function wrangleData() {
  //extract features (opcine)
  const topoData = topojson.feature(croatia, croatia.objects.hrvatska);
  //   console.log(topoData); //556 opcina

  projection = d3
    .geoAlbers()
    .rotate([-15, 0])
    .fitExtent(
      [
        [0, 20],
        [width * 0.9, height * 0.9],
      ],
      topoData
    );
  path = d3.geoPath(projection);

  let populationMax = d3.max(populationData, (d) => +d.Population);
  radiusScale = d3.scaleSqrt().domain([0, populationMax]).range([1.25, 25]);

  municipalities = getMunicipalityData(topoData);

  console.log(municipalities);

  let opcineSelection = renderGeography();

  transformToCircles(opcineSelection)
    .end()
    .then(() => {
      console.log("transfored to circles.");
      createScatterPlot();
    });
}

function createScatterPlot() {
  const margin = { top: 50, right: 30, bottom: 100, left: 50 };

  // y scale: "↑ Prosječni dohodak po stanovniku", field "dohodak"
  const y = d3.scaleLinear()
    .domain(d3.extent(jlsData, d => d.dohodak))
    .rangeRound([height - margin.bottom, margin.top]);

  // x scale: "Stupanj obrazovanja (VSS, 20-65) →", field "obrazovanje"
  const x = d3.scaleLinear()
    .domain(d3.extent(jlsData, d => d.obrazovanje))
    .rangeRound([margin.left, width - margin.right]);

  
  // y and x axis
  const yAxisLeft = (g) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)
      .ticks(6)
      .tickFormat(d => `${d / 1000}k`)
    )
    .call((g) => g.select(".domain").remove())
    .call((g) => g.append("text")
      .attr("x", -margin.left + 15)
      .attr("y", y(d3.max(jlsData, (d) => d.dohodak)))
      .attr("fill", "black")
      .attr("text-anchor", "start")
      .style("font-size", "16px")
      .text("↑ Prosječni dohodak po stanovniku")
    )
    .call((g) => g.selectAll(".tick text")
      .style("font-size", "14px"));

  const xAxisBottom = (g) => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(20))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.append("text")
      .attr("x", width - margin.right)
      .attr("y", -10)
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .text("Stupanj obrazovanja (VSS, 20-65) →")
    )
    .call((g) => g.selectAll(".tick text")
      .style("font-size", "14px"));

  svg.selectAll("path")
    .transition()
    .delay((d) => d.rank * 2)
    .duration(2000)
    .attr("transform", function (d) {
      const b = this.getBBox();
      const currentCenterX = b.x + b.width / 2;
      const currentCenterY = b.y + b.height / 2;

      if (!d.properties.jls.obrazovanje) {
        console.log(d);
        return null;
      }

      const dx = x(d.properties.jls.obrazovanje) - currentCenterX;
      const dy = y(d.properties.jls.dohodak) - currentCenterY;

      return `translate(${dx},${dy})`;
    })
    .end()
    .then(() => {
      svg.append("g").call(xAxisBottom);
      svg.append("g").call(yAxisLeft);

      svg.selectAll("path")
        .on("mouseover", function (event, d) {
          let tooltip = d3.select("#tooltip");

          tooltip.style("display", "block");
          tooltip.select("#tooltip-title").text(d.properties.name.toLowerCase());
          tooltip.select("#tooltip-subtitle").text(d.properties.zup_name);

          tooltip.select("#candidate1-name").text("Milanović");
          tooltip.select("#candidate1-total").text(d3.format(",")(d.properties.votes.milanovic));
          tooltip.select("#candidate1-percent")
            .text(((d.properties.votes.milanovic / d.properties.votes.count) * 100).toFixed(2) + '%');

          tooltip.select("#candidate2-name").text("Primorac");
          tooltip.select("#candidate2-total").text(d3.format(",")(d.properties.votes.primorac));
          tooltip.select("#candidate2-percent")
            .text(((d.properties.votes.primorac / d.properties.votes.count) * 100).toFixed(2) + '%');

          let tooltipWidth = tooltip.node().getBoundingClientRect().width;
          let tooltipHeight = tooltip.node().getBoundingClientRect().height;

          let posX = event.pageX + 10;
          let posY = event.pageY + 10;

          if (posY + tooltipHeight > window.innerHeight) {
            posY = event.pageY - tooltipHeight - 10;
          }

          tooltip.style("left", `${posX}px`);
          tooltip.style("top", `${posY}px`);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });

    });
}



// helper functions:
function transformToCircles(selection) {
  return (
    selection
      .transition()
      .delay((d) => d.rank * 8)
      .duration(3000)
      // .duration(300)
      .attrTween("d", function (d, i) {
        return flubber.toCircle(
          path(d),
          d.properties.centroid[0],
          d.properties.centroid[1],
          d.properties.radius,
          {
            maxSegmentLength: 2,
          }
        );
      })
  );
}

function renderGeography() {
  svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let opcineSelection = svg
    .append("g")
    .selectAll("path")
    .data(municipalities)
    .enter()
    .append("path")
    .attr("fill", (county) => {
      if (
        !county.properties.votes.primorac ||
        !county.properties.votes.milanovic
      ) {
        return "lightgrey";
      } else if (
        county.properties.votes.primorac > county.properties.votes.milanovic
      ) {
        return color(
          county.properties.votes.primorac / county.properties.votes.count
        );
      } else {
        return color(
          -county.properties.votes.milanovic / county.properties.votes.count
        );
      }
    })
    .attr("stroke", "white")
    .attr("d", path);

  return opcineSelection;
}

function getMunicipalityData(topoData) {
  let retval = topoData.features
    .map((municipality) => {
      let population = populationData.find(
        (d) =>
          d.Name.toUpperCase() == municipality.properties.NAME_2.toUpperCase()
      );

      // if (!population) {
      //   console.log(municipality.properties.NAME_2);
      // }

      population = {
        id: municipality.properties.ID_2,
        name: municipality.properties.NAME_2,
        zup_name: municipality.properties.NAME_1,
        population: population ? +population.Population : 0,
        area: population ? +population.Area : 0,
      };

      const name = `${municipality.properties.NAME_2}`;
      const zup_name = `${municipality.properties.NAME_1}`;
      const votingDatum = votingData.find(
        (d) => d.gropNaziv.toUpperCase() == name.toUpperCase()
      );

      if (!votingDatum) {
        console.log(`Missing match: ${name}`);
        console.log(municipality.properties);
      }

      const jlsDatum = jlsData.find(
        (d) => d.jls.toUpperCase() == name.toUpperCase()
      );

      return {
        ...municipality,
        properties: {
          name,
          zup_name,
          votes: { ...votingDatum },
          jls: { ...jlsDatum },
          population,
          centroid: projection(
            turf.centroid(municipality.geometry).geometry.coordinates
          ),
          radius: radiusScale(population.population),
        },
      };
    })
    .filter((c) => c.properties.centroid)
    .sort((a, b) =>
      a.properties.centroid[0] < b.properties.centroid[0] ? -1 : 1
    )
    .map((d, i) => {
      let geometry;
      if (d.geometry.type !== "MultiPolygon") {
        geometry = d.geometry;
      } else {
        geometry = {
          type: d.geometry.type,
          coordinates: d.geometry.coordinates
            .sort((a, b) =>
              turf.area(turf.polygon(a)) > turf.area(turf.polygon(b)) ? -1 : 1
            )
            .slice(0, 1),
        };
      }
      return {
        ...d,
        rank: i,
        geometry,
      };
    });

  return retval;
}
