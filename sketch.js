let dataTable;
let saturday1;
const SPOT_WIDTH = 40;
const SPOT_HEIGHT = 60;
const SPOT_SPACING = 10;
const spotRows = [{ x: 10, y: 50 }, { x: 10, y: 300 }];
let colors = [];

function preload() {
  dataTable = loadTable("data/example_data.csv", "csv", "header");
  saturday1 = loadJSON("data/sat1.json");
}

function setup() {
  createCanvas(1200, 600);
  textAlign(CENTER);
  rectMode(CENTER);
}

function draw() {
  background(220);
  saturday1.cars.forEach(drawCar);
}

function drawCarStationary(car) {

}

function drawCar(car) {
  const position = getSpotPosition(car.row, car.index);
  fill(car.color);
  const border = 5;
  rect(position.x + border, position.y + border, SPOT_WIDTH, SPOT_HEIGHT);
}

function drawSpot(dataRow) {
  const index = dataRow.getNum("INDEX");
  const row = dataRow.getNum("ROW");
  const color = dataRow.getString("COLOR");
  const has_car = color.length > 0;
  const grassy = dataRow.getNum("GRASSY") != 0;
  const four_door = dataRow.getNum("FOUR_DOOR") != 0;
  const position = getSpotPosition(row, index);
  const x = position.x;
  const y = position.y;

  //car
  if (has_car) {
    fill(color);
    noStroke();
    const border = 5;
    const height = four_door ? SPOT_HEIGHT : SPOT_HEIGHT * (5 / 6);
    rect(x + border, y + border, SPOT_WIDTH - 2 * border, height - 2 * border);
  }

  if (!grassy) {
    //lines
    fill(0);
    stroke(0);
    line(x, y, x, y + SPOT_HEIGHT);
    line(x + SPOT_WIDTH, y, x + SPOT_WIDTH, y + SPOT_HEIGHT);
  } else {
    fill("SEAGREEN");
    rect(x, y - 5, SPOT_WIDTH, SPOT_HEIGHT + 20, 5)
  }
}

function getSpotPosition(row, index) {
  const x = spotRows[row].x + index * (SPOT_WIDTH + SPOT_SPACING);
  const y = spotRows[row].y;
  return createVector(x, y);
}