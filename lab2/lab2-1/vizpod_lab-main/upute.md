# 📘 **D3.js Cheat Sheet za laboratorijske vježbe**

Ovaj cheat sheet pokriva **ključne D3.js koncepte** potrebne za rješavanje zadatka. Fokus je na stvaranju interaktivnih vizualizacija s **X/Y Scatter Plotom** i **Popisom podataka (bulleted list)**.

---

## **1. Kreiranje i korištenje skala (`scaleLinear`, `scaleOrdinal`)**

**Što radi?**  
Skale transformiraju vrijednosti podataka u pozicije (X, Y), veličine (font size, širina, visina) ili boje.

### 🛠️ **Primjeri**

```javascript
// Skala za X-os (npr. za "age", raspon od 0 do 100)
const xScale = d3
  .scaleLinear()
  .domain([0, 100]) // Vrijednosti u podacima
  .range([0, 500]); // Veličina osi u pikselima (0 do 500px)

// Skala za Y-os (npr. za "score", raspon od 0 do 100)
const yScale = d3.scaleLinear().domain([0, 100]).range([400, 0]); // Y-os ide odozdo prema gore (veće vrijednosti gore)

// Skala za veličinu fonta (varira od 8px do 18px)
const fontSizeScale = d3
  .scaleLinear()
  .domain([0, 100]) // Vrijednosti "age" od 0 do 100
  .range([8, 18]); // Font veličina od 8px do 18px

// Skala za boje (npr. za "eyeColor")
const colorScale = d3
  .scaleOrdinal()
  .domain(["blue", "green", "brown", "hazel", "gray"])
  .range(["#4A90E2", "#50C878", "#8B4513", "#CD853F", "#A9A9A9"]);
```

---

## **2. Dodavanje SVG elemenata (`rect`, `circle`, `text`)**

**Što radi?**  
Dodavanje elemenata na SVG koristeći D3 **"enter-update-exit"** pristup.

### 🛠️ **Primjeri**

```javascript
// Dodavanje "text" elemenata u scatter plot
d3.select("#viz1") // Selektiraj SVG element
  .selectAll("text") // Selektiraj sve (nepostojeće) tekstualne elemente
  .data(dataset) // Poveži podatke s tim elementima
  .enter() // Ulaz (dodavanje novih elemenata)
  .append("text") // Dodaj novi <text> element za svaki podatak
  .attr("x", (d) => xScale(d.age)) // Postavi X-koordinatu prema "age"
  .attr("y", (d) => yScale(d.score)) // Postavi Y-koordinatu prema "score"
  .attr("font-size", (d) => fontSizeScale(d.age)) // Dinamički odredi veličinu fonta
  .attr("fill", (d) => colorScale(d.eyeColor)) // Boja teksta prema boji očiju
  .text((d) => d.name); // Prikazuje ime osobe kao tekst
```

---

## **3. Postavljanje osi (`axisBottom`, `axisLeft`)**

**Što radi?**  
Dodaje osi (X i Y) za vizualizaciju podataka.

### 🛠️ **Primjeri**

```javascript
// X-os (ispod scatter plota)
const xAxis = d3.axisBottom(xScale);

d3.select("#viz1")
  .append("g")
  .attr("transform", "translate(0, 400)") // Pomakni na dno SVG-a
  .call(xAxis);

// Y-os (lijevo scatter plota)
const yAxis = d3.axisLeft(yScale);

d3.select("#viz1")
  .append("g")
  .attr("transform", "translate(0, 0)") // Lijevo na početku SVG-a
  .call(yAxis);
```

---

## **4. Dodavanje evenata (event listeners)**

**Što radi?**  
Dodaje događaje poput `mouseover`, `mouseout`, i `click` kako bi omogućio interaktivnost.

### 🛠️ **Primjeri**

```javascript
// Dodavanje "mouseover" događaja za svaku osobu u scatter plotu
d3.selectAll("text")
  .on("mouseover", function (event, d) {
    d3.select(this).style("font-weight", "bold").style("fill", "red");
  })
  .on("mouseout", function (event, d) {
    d3.select(this)
      .style("font-weight", "normal")
      .style("fill", colorScale(d.eyeColor));
  });
```

---

## **5. Povezivanje dvije vizualizacije**

**Što radi?**  
Dodaje interaktivnost između scatter plota i bulleted liste.

### 🛠️ **Primjeri**

```javascript
// Poveži hover na popis podataka s hoverom na scatter plotu
d3.selectAll(".list-item")
  .on("mouseover", function (event, d) {
    d3.selectAll("text")
      .filter((textData) => textData.name === d.name)
      .style("font-size", "20px")
      .style("font-weight", "bold");
  })
  .on("mouseout", function (event, d) {
    d3.selectAll("text")
      .filter((textData) => textData.name === d.name)
      .style("font-size", (d) => fontSizeScale(d.age))
      .style("font-weight", "normal");
  });
```

---

## **6. Stiliziranje elemenata (`style()`)**

### 🛠️ **Primjeri**

```javascript
// Stiliziranje teksta u scatter plotu
d3.selectAll("text")
  .style("font-family", "Arial")
  .style("text-anchor", "middle");
```

---

## **7. Enter-Update-Exit Pristup**

### 🛠️ **Primjeri**

```javascript
const texts = d3
  .select("#viz1")
  .selectAll("text")
  .data(newDataset, (d) => d.name);

texts
  .enter()
  .append("text")
  .attr("x", (d) => xScale(d.age))
  .attr("y", (d) => yScale(d.score))
  .attr("font-size", (d) => fontSizeScale(d.age))
  .text((d) => d.name);

texts.attr("x", (d) => xScale(d.age)).attr("y", (d) => yScale(d.score));

texts.exit().remove();
```

---

## 📘 **Najvažnije funkcije**

| **Funkcija** | **Opis**                                 |
| ------------ | ---------------------------------------- |
| `.data()`    | Povezuje podatke s elementima            |
| `.enter()`   | Dodaje nove elemente                     |
| `.exit()`    | Briše elemente koji više nisu u podacima |
| `.attr()`    | Dodaje ili mijenja atribute              |
| `.style()`   | Dodaje ili mijenja stilove               |
| `.on()`      | Dodaje događaje (hover, click, itd.)     |

---

S ovim "cheat sheetom" imate sve ključne koncepte potrebne za izradu zadatka. 😊
