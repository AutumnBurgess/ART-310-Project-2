let dataTable;
let saturday1;
const CAR_WIDTH = 75;
const CAR_HEIGHT = 50;
const SPOT_SPACING = 10;
const spotRows = [{ x: -20, y: 50 }, { x: -20, y: 300 }];
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
  saturday1.cars.forEach(drawCarStationary);
}

function drawCarStationary(car) {
  const position = getSpotPosition(car.row, car.index);
  push();
  translate(position.x, position.y);
  rotate(car.row == 0 ? -HALF_PI : HALF_PI);
  drawCar(car);
  pop();
}


function drawCarTemp(car) {
  const position = getSpotPosition(car.row, car.index);
  fill(car.color);
  const border = 5;
  rect(position.x + border, position.y + border, CAR_WIDTH, CAR_HEIGHT);
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
    const height = four_door ? CAR_HEIGHT : CAR_HEIGHT * (5 / 6);
    rect(x + border, y + border, CAR_WIDTH - 2 * border, height - 2 * border);
  }

  if (!grassy) {
    //lines
    fill(0);
    stroke(0);
    line(x, y, x, y + CAR_HEIGHT);
    line(x + CAR_WIDTH, y, x + CAR_WIDTH, y + CAR_HEIGHT);
  } else {
    fill("SEAGREEN");
    rect(x, y - 5, CAR_WIDTH, CAR_HEIGHT + 20, 5)
  }
}

function getSpotPosition(row, index) {
  const x = spotRows[row].x + index * (CAR_HEIGHT + SPOT_SPACING);
  const y = spotRows[row].y;
  return createVector(x, y);
}