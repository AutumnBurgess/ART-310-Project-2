let carData;
let dayData;
let saturday;
let sunday;
let monday;
let currentDay;
const CAR_HEIGHT = 75;
const CAR_WIDTH = 50;
const SPOT_SPACING = 15;
const parkingRows = [{ x: 50, y: 120, count: 19, ignore: [7, 8] }, { x: 50, y: 500 - 120, count: 17, ignore: [] }];
let colors = [];

function preload() {
  carData = loadJSON("data/cars.json");
  dayData = loadJSON("data/days.json");
  saturday = loadJSON("oldData/saturday.json");
  sunday = loadJSON("oldData/sunday.json");
  monday = loadJSON("oldData/monday.json");

}

function setup() {
  createCanvas(1300, 500);
  rectMode(CENTER);
  currentDay = dayData.days[0];
}

function draw() {
  background(150);
  drawDay(currentDay);

  drawLines();
  drawGrassArea();
  checkHover();
}

function drawDay(day) {
  const name = day.name;
  const rows = day.rows;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    for (let position = 0; position < row.length; position++) {
      const id = row[position];
      if (id >= 0) {
        const car = carData.cars[id];
        drawCarStationary(car, rowIndex, position)
      }
    }
  }
}

function drawCarStationary(car, row, position) {
  const location = getSpotPosition(row, position);
  push();
  translate(location.x, location.y);
  rotate(row == 0 ? -HALF_PI : HALF_PI);
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
    if (car.stickers.length == 1) {
      rect((5 - CAR_HEIGHT / 2) + car.stickers[0].length / 5, 0, 5, 5);
    } else {
      for (let i = 0; i < car.stickers.length; i++) {
        const sticker = car.stickers[i];
        const sX = (5 - CAR_HEIGHT / 2) + sticker.length / 5;
        const sY = map(i, 0, car.stickers.length - 1, 7 - CAR_WIDTH / 2, CAR_WIDTH / 2 - 7);
        rect(sX, sY, 5, 5);
      }
    }
  }
  pop();
}

function checkHover() {
  for (let row = 0; row < parkingRows.length; row++) {
    for (let i = 0; i < parkingRows[row].count; i++) {
      const carPosition = getSpotPosition(row, i);
      const inHorizontal = abs(carPosition.x - mouseX) < CAR_WIDTH / 2;
      const inVertical = abs(carPosition.y - mouseY) < CAR_HEIGHT / 2;
      if (inHorizontal && inVertical) {
        const carIndex = currentDay.rows[row][i];
        if (carIndex >= 0) {
          const hoverCar = carData.cars[carIndex];
          carText(carPosition, hoverCar, row);
        }
      }
    }
  }
}

function carText(carPosition, hoverCar, row) {
  const onFront = (carPosition.y - mouseY > 0) == (row == 0);
  //text(onFront, carPosition.x, carPosition.y);
  if (onFront) {
    const rearView = hoverCar.rear_view;
    if (rearView) {
      text(rearView, carPosition.x, carPosition.y);
    }
  } else {
    const stickers = hoverCar.stickers;
    if (stickers) {
      text(stickers.join("\n"), carPosition.x, carPosition.y);
    }
  }
}

function drawLines() {
  push();
  stroke("yellow");
  strokeWeight(5);
  for (let row of parkingRows) {
    for (let i = -1; i < row.count; i++) {
      if (row.ignore.indexOf(i) < 0) { //don't draw line if ignored
        let x = row.x + CAR_WIDTH / 2 + i * (CAR_WIDTH + SPOT_SPACING) + SPOT_SPACING / 2;
        line(x, row.y - CAR_HEIGHT / 2 - 10, x, row.y + CAR_HEIGHT / 2 + 10);
      }
    }
  }
  pop();
}

function drawGrassArea() {
  const position = getSpotPosition(0, 8);
  fill("darkgreen");
  noStroke();
  strokeWeight(2);
  rect(position.x, position.y - CAR_HEIGHT, CAR_WIDTH + SPOT_SPACING, CAR_HEIGHT * 3);
  rectMode(CORNER)
  rect(0, 0, width, parkingRows[0].y - CAR_HEIGHT / 2 - 20);
  rectMode(CENTER);
  arc(position.x, position.y + CAR_HEIGHT / 2, CAR_WIDTH + SPOT_SPACING, CAR_WIDTH + SPOT_SPACING, 0, PI)
  //traffic cone
  fill("orange");
  stroke(0);
  strokeWeight(1);
  ellipse(position.x - CAR_WIDTH / 3, position.y + CAR_HEIGHT / 3, 15, 15);
  ellipse(position.x - CAR_WIDTH / 3, position.y + CAR_HEIGHT / 3, 10, 10);
  fill("white");
  ellipse(position.x - CAR_WIDTH / 3, position.y + CAR_HEIGHT / 3, 5, 5);
}

function getSpotPosition(row, index) {
  const x = parkingRows[row].x + index * (CAR_WIDTH + SPOT_SPACING);
  const y = parkingRows[row].y;
  return createVector(x, y);
}