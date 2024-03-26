let carData;
let dayData;
let currentDay;
let currentTransition = [];
let transitionPoint = 0;

const IDLE = 0;
const TRANSITION = 1;
let state = IDLE;
const CAR_HEIGHT = 75;
const CAR_WIDTH = 50;
const SPOT_SPACING = 15;
const parkingRows = [{ x: 50, y: 120, count: 19, ignore: [7, 8] }, { x: 50, y: 500 - 120, count: 17, ignore: [] }];
const DEFAULT_LANE = 250;
const DEFAULT_RADIUS = 90;
let colors = [];

function preload() {
  carData = loadJSON("data/cars.json");
  dayData = loadJSON("data/days.json");
}

function setup() {
  currentDay = dayData.days[0];
  select("#saturday").position(10, 10);
  select("#sunday").position(80, 10);
  select("#monday").position(140, 10);
  createCanvas(1300, 500);
  rectMode(CENTER);

}

function draw() {
  background(150);
  drawLines();
  drawGrassArea();
  if (state == IDLE) {
    drawDay(currentDay);
    checkHover();
  } else if (state == TRANSITION) {
    displayTransition(currentTransition);
  }
}

function changeDay(num) {
  if (state == TRANSITION) return;
  const newDay = dayData.days[num];
  if (currentDay == newDay) return;
  currentTransition = buildDayBetween(currentDay, newDay);
  currentDay = newDay;
  transitionPoint = 0;
  state = TRANSITION;
}

function buildExit(id, car, row, position) {
  const location = getSpotLocation(row, position);
  const path = createExitPath(location.x, location.y, DEFAULT_LANE + random(-10, 10), DEFAULT_RADIUS);
  return { car: car, path: path };
}

function buildDayExit(day) {
  return forAllCars(day, buildExit);
}

function buildEnter(id, car, row, position) {
  const location = getSpotLocation(row, position);
  const path = createEnterPath(location.x, location.y, DEFAULT_LANE + random(-10, 10), DEFAULT_RADIUS);
  return { car: car, path: path };
}

function buildDayEnter(day) {
  return forAllCars(day, buildEnter);
}

function buildDayBetween(startDay, endDay) {
  function buildBetween(id, car, row, position) {
    const endCar = searchDay(endDay, id);
    if (!endCar.found) {
      return undefined;
    }
    if (row == endCar.row && position == endCar.position) {
      const location = getSpotLocation(row, position);
      const path = createStationaryPath(location.x, location.y, row == 0 ? -HALF_PI : HALF_PI);
      return { car: car, path: path };
    }
    const startLocation = getSpotLocation(row, position);
    const endLocation = getSpotLocation(endCar.row, endCar.position);
    const path = createBetweenPath(startLocation.x, startLocation.y, endLocation.x, endLocation.y, DEFAULT_LANE, DEFAULT_RADIUS);
    return { car: car, path: path };
  }
  let out = forAllCars(startDay, buildBetween);
  out = out.filter(e => e); //filter out undefined
  let exits = forAllCars(startDay, buildExit);
  let enters = forAllCars(endDay, buildEnter);
  //filter out cars already in start day
  exits = exits.filter(e => !(out.find(o => o.car == e.car)));
  enters = enters.filter(e => !(out.find(o => o.car == e.car)));
  out = out.concat(enters).concat(exits);
  return out;
}

function searchDay(day, searchId) {
  const rows = day.rows;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    for (let position = 0; position < row.length; position++) {
      const id = row[position];
      if (id == searchId) {
        return { found: true, row: rowIndex, position: position };
      }
    }
  }
  return { found: false };
}

function displayTransition(transitions) {
  transitionPoint += 0.003;
  if (transitionPoint < 1) {
    for (let transition of transitions) {
      push();
      transition.path.transform(transitionPoint);
      drawCar(transition.car);
      pop();
    }
  } else {
    transitionPoint = 0;
    drawDay(currentDay);
    state = IDLE;
  }
}

function forAllCars(day, func) {
  let out = [];
  const rows = day.rows;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    for (let position = 0; position < row.length; position++) {
      const id = row[position];
      if (id >= 0) {
        const car = carData.cars[id];
        const returnValue = func(id, car, rowIndex, position);
        out.push(returnValue);
      }
    }
  }
  return out;
}

function drawDay(day) {
  forAllCars(day, drawCarStationary);
}

function drawCarStationary(id, car, row, position) {
  const location = getSpotLocation(row, position);
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
      const carPosition = getSpotLocation(row, i);
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
  const position = getSpotLocation(0, 8);
  fill("darkgreen");
  noStroke();
  strokeWeight(2);
  rect(position.x, position.y - CAR_HEIGHT, CAR_WIDTH + SPOT_SPACING, CAR_HEIGHT * 3 + 1);
  rectMode(CORNER)
  rect(0, 0, width, parkingRows[0].y - CAR_HEIGHT / 2 - 20);
  rectMode(CENTER);
  arc(position.x, position.y + CAR_HEIGHT / 2, CAR_WIDTH + SPOT_SPACING, CAR_WIDTH + SPOT_SPACING, 0, PI)
  //traffic cone
  fill("orange");
  stroke(0);
  strokeWeight(1);
  const coneX = position.x - CAR_WIDTH / 4;
  const coneY = position.y + CAR_HEIGHT / 3
  ellipse(coneX, coneY, 15, 15);
  ellipse(coneX, coneY, 10, 10);
  fill("white");
  ellipse(coneX, coneY, 5, 5);
}

function getSpotLocation(row, index) {
  const x = parkingRows[row].x + index * (CAR_WIDTH + SPOT_SPACING);
  const y = parkingRows[row].y;
  return createVector(x, y);
}