let dataTable;

function preload() {
  dataTable = loadTable("data.csv", "csv", "header");
}

function setup() {
  createCanvas(800, 800);
  colorMode("HSB", 100);
}

function draw() {
  background(220);
  for (let rowNumber = 0; rowNumber < dataTable.getRowCount(); rowNumber++) {
    let row = dataTable.getRow(rowNumber);
    let x = 100;
    let y = rowNumber * 100 + 100;
    let hue = row.getNum("HUE");
    let c = color(hue, 100, 100);
    fill(c);
    ellipse(x, y, row.getNum("SIZE"));

    text(row.getString("NAME"), x + 50, y);
  }
}
