let dataTable;
let carData;
const CAR_HEIGHT = 75;
const CAR_WIDTH = 50;
const SPOT_SPACING = 15;
const spotRows = [{ x: 0, y: 100, count: 19, ignore: [8, 9] }, { x: 0, y: 350, count: 17, ignore: [] }];
let colors = [];

function preload() {
  dataTable = loadTable("data/example_data.csv", "csv", "header");
  carData = loadJSON("data/sat1.json");
}

function setup() {
  createCanvas(1500, 500);
  rectMode(CENTER);
}

function draw() {
  background(150);
  carData.cars.forEach(drawCarStationary);
  drawLines();
  drawGrassArea(getSpotPosition(0, 9));
  checkHover();
}

function checkHover() {
  for (let row = 0; row < spotRows.length; row++) {
    for (let i = 1; i <= spotRows[row].count; i++) {
      const carPosition = getSpotPosition(row, i);
      const inHorizontal = abs(carPosition.x - mouseX) < CAR_WIDTH / 2;
      const inVertical = abs(carPosition.y - mouseY) < CAR_HEIGHT / 2;
      if (inHorizontal && inVertical) {
        const hoveringCar = carData.cars.find(e => e.row == row && e.index == i);
        if (hoveringCar) {
          carText(carPosition, hoveringCar);
        }
      }
    }
  }
}

function carText(carPosition, hoveringCar) {
  const onFront = (carPosition.y - mouseY > 0) == (hoveringCar.row == 0);
  if (onFront) {
    const rearView = hoveringCar.rear_view;
    if (rearView) {
      text(rearView, carPosition.x, carPosition.y);
    }
  } else {
    const stickers = hoveringCar.stickers;
    if (stickers) {
      text(stickers.join("\n"), carPosition.x, carPosition.y);
    }
  }
}

function drawLines() {
  push();
  stroke("yellow");
  strokeWeight(5);
  for (let row of spotRows) {
    for (let i = 0; i <= row.count; i++) {
      if (row.ignore.indexOf(i) < 0) { //don't draw line if ignored
        let x = row.x + CAR_WIDTH / 2 + i * (CAR_WIDTH + SPOT_SPACING) + SPOT_SPACING / 2;
        line(x, row.y - CAR_HEIGHT / 2 - 10, x, row.y + CAR_HEIGHT / 2 + 10);
      }
    }
  }
  pop();
}

function drawGrassArea(position) {
  fill("darkgreen");
  stroke("grey");
  strokeWeight(2);
  rect(position.x, position.y, CAR_WIDTH + SPOT_SPACING, CAR_HEIGHT + 60);
  fill("orange");
  stroke(0);
  strokeWeight(1);
  ellipse(position.x - CAR_WIDTH / 3, position.y + CAR_HEIGHT / 3, 15, 15);
  ellipse(position.x - CAR_WIDTH / 3, position.y + CAR_HEIGHT / 3, 10, 10);
  fill("white");
  ellipse(position.x - CAR_WIDTH / 3, position.y + CAR_HEIGHT / 3, 5, 5);
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
  rect(0, 0, CAR_HEIGHT, CAR_WIDTH, 5);
  fill(255);
  stroke(0);
  ellipse(CAR_HEIGHT / 2, -10, 10, 10);
  ellipse(CAR_HEIGHT / 2, 10, 10, 10);
  if (car.rear_view) {
    ellipse(CAR_HEIGHT / 2 - 10, 0, 5, 5);
  }
  if (car.stickers) {
    for (let i = 0; i < car.stickers.length; i++) {
      const sticker = car.stickers[i];
      const sX = (5 - CAR_HEIGHT / 2) + sticker.length / 5;
      const sY = map(i, 0, car.stickers.length - 1, 7 - CAR_WIDTH / 2, CAR_WIDTH / 2 - 7);
      rect(sX, sY, 5, 5);
    }
  }
  pop();
}

function getSpotPosition(row, index) {
  const x = spotRows[row].x + index * (CAR_WIDTH + SPOT_SPACING);
  const y = spotRows[row].y;
  return createVector(x, y);
}