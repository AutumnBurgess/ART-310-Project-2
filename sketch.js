let dataTable;
let saturday1;
const CAR_WIDTH = 75;
const CAR_HEIGHT = 50;
const SPOT_SPACING = 15;
const spotRows = [{ x: 0, y: 100, count: 19, ignore: [8, 9] }, { x: 0, y: 350, count: 20, ignore: [] }];
let colors = [];

function preload() {
  dataTable = loadTable("data/example_data.csv", "csv", "header");
  saturday1 = loadJSON("data/sat1.json");
}

function setup() {
  createCanvas(1500, 500);
  textAlign(CENTER);
  rectMode(CENTER);
}

function draw() {
  background(150);
  saturday1.cars.forEach(drawCarStationary);
  drawLines();
  drawGrassArea();
}

function drawLines() {
  push();
  stroke("yellow");
  strokeWeight(5);
  for (let row of spotRows) {
    for (let i = 0; i <= row.count; i++) {
      if (row.ignore.indexOf(i) < 0) { //don't draw line if ignored
        let x = row.x + CAR_HEIGHT / 2 + i * (CAR_HEIGHT + SPOT_SPACING) + SPOT_SPACING / 2;
        line(x, row.y - CAR_WIDTH / 2 - 10, x, row.y + CAR_WIDTH / 2 + 10);
      }
    }
  }
  pop();
}

function drawGrassArea() {
  const position = getSpotPosition(0, 9);
  fill("darkgreen");
  noStroke();
  rect(position.x, position.y, CAR_HEIGHT + SPOT_SPACING, CAR_WIDTH + 60, 10);
  fill("orange");
  stroke(0);
  ellipse(position.x - CAR_HEIGHT / 3, position.y + CAR_WIDTH / 3, 15, 15);
  ellipse(position.x - CAR_HEIGHT / 3, position.y + CAR_WIDTH / 3, 10, 10);
  fill("white");
  ellipse(position.x - CAR_HEIGHT / 3, position.y + CAR_WIDTH / 3, 5, 5);
}

function drawCarStationary(car) {
  const position = getSpotPosition(car.row, car.index);
  push();
  translate(position.x, position.y);
  rotate(car.row == 0 ? -HALF_PI : HALF_PI);
  drawCar(car);
  pop();
}

function drawCar(car) {
  push();
  fill(car.color);
  noStroke();
  rect(0, 0, CAR_WIDTH, CAR_HEIGHT, 5);
  fill(255);
  stroke(0);
  ellipse(CAR_WIDTH / 2, -10, 10, 10);
  ellipse(CAR_WIDTH / 2, 10, 10, 10);
  if (car.rear_view) {
    ellipse(CAR_WIDTH / 2 - 10, 0, 5, 5);
  }
  if (car.stickers) {
    for (let i = 0; i < car.stickers.length; i++) {
      const sticker = car.stickers[i];
      const sX = (5 - CAR_WIDTH / 2) + sticker.length / 5;
      const sY = map(i, 0, car.stickers.length - 1, 7 - CAR_HEIGHT / 2, CAR_HEIGHT / 2 - 7);
      rect(sX, sY, 5, 5);
    }
  }
  pop();
}

function getSpotPosition(row, index) {
  const x = spotRows[row].x + index * (CAR_HEIGHT + SPOT_SPACING);
  const y = spotRows[row].y;
  return createVector(x, y);
}