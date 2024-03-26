let carData;
let dayData;
let currentDay;
let hoveredRearView = false;
let hoveredStickers = false;
let currentTransition = [];
let transitionPoint = 0;
let narrowFont;
let wideFont;

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
  narrowFont = loadFont("assets/GothicNarrow.TTF");
  wideFont = loadFont("assets/GothicWide.TTF");
}

function setup() {
  createCanvas(1300, 500);
  rectMode(CENTER);
  textAlign(CENTER);


  currentDay = dayData.days[0];
  select("#saturday").position(10, 10).style("color", "grey");;
  select("#sunday").position(80, 10);
  select("#monday").position(140, 10);
}

//////////////////////////////////////Drawing//////////////////////////////////////
function draw() {
  background(150);
  drawParkingLines();
  drawGrassArea();
  textAlign(CENTER, CENTER);
  textSize(35);
  textFont(wideFont);
  text("Behind Sunvilla: Lot 33", width / 2, 30);
  if (state == IDLE) {
    drawDay(currentDay);
    checkHover();
    hoverHints();
  } else if (state == TRANSITION) {
    drawTransition(currentTransition);
  }
}

function drawDay(day) {
  forAllCars(day, drawCarInSpot);
}

function drawTransition(transitions) {
  transitionPoint += 0.003;
  if (transitionPoint < 1) {
    for (let transition of transitions) {
      push();
      //these aren't 0 and 1 because there are some glitches when the value is exactly 0 or 1 so this is a hack around that :)
      const thisTransitionPoint = map(transitionPoint, transition.start, transition.start + transition.duration, 0.00001, 0.9999, true);
      transition.path.transform(thisTransitionPoint);
      drawCar(transition.car);
      pop();
    }
  } else {
    transitionPoint = 0;
    drawDay(currentDay);
    state = IDLE;
  }
}

function drawCarInSpot(id, car, row, position) {
  const location = getSpotLocation(row, position);
  push();
  translate(location.x, location.y);
  rotate(row == 0 ? -HALF_PI : HALF_PI);
  drawCar(car);
  pop();
}

function drawCar(car) {
  push();
  stroke("yellow");
  strokeWeight(4);
  line(CAR_HEIGHT / 2, -15, CAR_HEIGHT / 2, -8);
  line(CAR_HEIGHT / 2, 15, CAR_HEIGHT / 2, 8);

  //tires
  strokeWeight(1);
  noStroke();
  fill(0);
  rect(CAR_HEIGHT / 4 - 4, CAR_WIDTH / 2 - 2, 15, 5);
  rect(CAR_HEIGHT / 4 - 4, 2 - CAR_WIDTH / 2, 15, 5);
  rect(-CAR_HEIGHT / 4 - 4, CAR_WIDTH / 2 - 2, 15, 5);
  rect(-CAR_HEIGHT / 4 - 4, 2 - CAR_WIDTH / 2, 15, 5);
  //body
  fill(car.color);
  rect(0, 0, CAR_HEIGHT, CAR_WIDTH - 8, 5);
  //windshield
  fill(255);
  stroke(0);
  quad(30, 12, 30, -12, 15, -14, 15, 14);

  if (car.rear_view) {
    ellipse(CAR_HEIGHT / 2 - 13, 0, 5, 5);
  }
  if (car.stickers) {
    if (car.stickers.length == 1) {
      rect((5 - CAR_HEIGHT / 2) + car.stickers[0].length / 5, 0, 5, 5);
    } else {
      for (let i = 0; i < car.stickers.length; i++) {
        const sticker = car.stickers[i];
        const sX = (5 - CAR_HEIGHT / 2) + sticker.length / 5;
        const sY = map(i, 0, car.stickers.length - 1, 8 - CAR_WIDTH / 2, CAR_WIDTH / 2 - 8);
        rect(sX, sY, 4, 4);
      }
    }
  }
  pop();
}

function hoverHints() {
  push();
  if (!hoveredRearView) {
    //rearView 375,95
    stroke("red");
    strokeWeight(3);
    let offset = sin(frameCount / 15) * 8 - 10;
    let bX = 375 + offset;
    let bY = 95 + offset;
    line(bX, bY, bX - 15, bY);
    line(bX, bY, bX, bY - 15);
    line(bX, bY, bX - 40, bY - 40);
    if (dist(mouseX, mouseY, bX - offset, bY - offset) < 12) {
      hoveredRearView = true;
    }
  }
  if (!hoveredStickers) {
    //sticker 375,350
    stroke("red");
    strokeWeight(3);
    let offset = sin(frameCount / 15) * 8 - 10;
    let bX = 375 + offset;
    let bY = 355 - offset;
    line(bX, bY, bX - 15, bY);
    line(bX, bY, bX, bY + 15);
    line(bX, bY, bX - 40, bY + 40);
    if (dist(mouseX, mouseY, bX - offset, bY + offset) < 12) {
      hoveredStickers = true;
    }
  }
  pop();
}

function checkHover() {
  fill(255);
  textSize(20);
  textFont(narrowFont);
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
  let textX = carPosition.x;
  let textY = carPosition.y;
  if (row == 0) {
    textAlign(CENTER, TOP);
    textY += CAR_HEIGHT / 2 + 15;
  } else {
    textAlign(CENTER, BOTTOM);
    textY -= CAR_HEIGHT / 2 + 15;
  }
  if (onFront) {
    const rearView = hoverCar.rear_view;
    if (rearView) {
      text(rearView, textX, textY);
    }
  } else {
    const stickers = hoverCar.stickers;
    if (stickers) {
      text(stickers.join("\n"), textX, textY);
    }
  }
}

function drawParkingLines() {
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
  push();
  const position = getSpotLocation(0, 8);
  fill("darkgreen");
  noStroke();
  strokeWeight(2);
  rect(position.x, position.y - CAR_HEIGHT, CAR_WIDTH + SPOT_SPACING, CAR_HEIGHT * 3 + 1);
  rectMode(CORNER)
  rect(0, 0, width, parkingRows[0].y - CAR_HEIGHT / 2 - 20);
  push();
  fill("lightgrey");
  rect(0, 450, width, height);
  pop();
  rectMode(CENTER);
  arc(position.x, position.y + CAR_HEIGHT / 2, CAR_WIDTH + SPOT_SPACING, CAR_WIDTH + SPOT_SPACING, 0, PI)
  //traffic cone
  // fill("orange");
  // stroke(0);
  // strokeWeight(1);
  // const coneX = position.x - CAR_WIDTH / 4;
  // const coneY = position.y + CAR_HEIGHT / 3
  // ellipse(coneX, coneY, 15, 15);
  // ellipse(coneX, coneY, 10, 10);
  // fill("white");
  // ellipse(coneX, coneY, 5, 5);
  pop();
}

/////////////////////////////////////////Transitions/////////////////////////////////////
function changeDay(num) {
  if (state == TRANSITION) return;
  const newDay = dayData.days[num];
  if (currentDay == newDay) return;
  currentTransition = buildDayBetween(currentDay, newDay);
  select("#" + currentDay.name).style("color", "black");
  select("#" + newDay.name).style("color", "grey");
  currentDay = newDay;
  transitionPoint = 0;
  state = TRANSITION;
}

function buildDayBetween(startDay, endDay) {
  function buildExit(id, car, row, position) {
    const location = getSpotLocation(row, position);
    const path = createExitPath(location.x, location.y, DEFAULT_LANE + random(-30, 30), DEFAULT_RADIUS + random(-10, 10));
    const duration = random(0.5, 0.75);
    const start = random(0, 0.2);
    return { car: car, path: path, start: start, duration: duration };
  }

  function buildEnter(id, car, row, position) {
    const location = getSpotLocation(row, position);
    const path = createEnterPath(location.x, location.y, DEFAULT_LANE + random(-30, 30), DEFAULT_RADIUS + random(-10, 10));
    const duration = random(0.5, 0.75);
    const start = random(0, 0.2);
    return { car: car, path: path, start: start, duration: duration };
  }
  function buildBetween(id, car, row, position) {
    const endCar = searchDay(endDay, id);
    if (!endCar.found) {
      return undefined;
    }
    if (row == endCar.row && position == endCar.position) {
      const location = getSpotLocation(row, position);
      const path = createStationaryPath(location.x, location.y, row == 0 ? -HALF_PI : HALF_PI);
      return { car: car, path: path, start: 0, duration: 1 };
    }
    const startLocation = getSpotLocation(row, position);
    const endLocation = getSpotLocation(endCar.row, endCar.position);
    const path = createBetweenPath(startLocation.x, startLocation.y, endLocation.x, endLocation.y, DEFAULT_LANE + random(-30, 30), DEFAULT_RADIUS + random(-10, 10));
    const duration = random(0.5, 0.75);
    const start = random(0, 0.2);
    return { car: car, path: path, start: start, duration: duration };
  }
  //get transitions of cars in both days, the first day, the last day
  let betweens = forAllCars(startDay, buildBetween).filter(e => e); //filter out undefined
  let exits = forAllCars(startDay, buildExit);
  let enters = forAllCars(endDay, buildEnter);
  //filter out cars in both
  exits = exits.filter(e => !(betweens.find(o => o.car == e.car)));
  enters = enters.filter(e => !(betweens.find(o => o.car == e.car)));
  //return all of them together
  return betweens.concat(enters).concat(exits);
}

//return row and position of id in a given day
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

//iterate func on all cars in a given day
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

function getSpotLocation(row, index) {
  const x = parkingRows[row].x + index * (CAR_WIDTH + SPOT_SPACING);
  const y = parkingRows[row].y;
  return createVector(x, y);
}