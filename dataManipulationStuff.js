/*
This was all temporary code to process the data. Good luck if you want to understand it!
*/

function combineDays() {
    let outJSON = { days: [{ day: "Saturday", rows: saturday.rows }, { day: "Sunday", rows: sunday.rows }, { day: "Monday", rows: monday.rows }] };
    console.log(JSON.stringify(outJSON));
}

function newData() {
    let row0 = [];
    for (let i = 0; i < 19; i++) row0.push(-1);
    let row1 = [];
    for (let i = 0; i < 17; i++) row1.push(-1);

    for (let car = 0; car < monday.cars.length; car++) {
        const inCar = monday.cars[car];
        let found = false;
        for (let check = 0; check < carData.cars.length; check++) {
            const checkCar = carData.cars[check];
            const sameColor = checkCar.color == inCar.color;
            const samePlate = checkCar.plate == inCar.plate;
            if (sameColor && samePlate) {
                found = true;
                if (inCar.row == 0) {
                    row0[inCar.index - 1] = check;
                } else {
                    row1[inCar.index - 1] = check;
                }
            }
        }
        if (!found) console.log("ahhhhhh!!!!!\nfuck!!!!!!!!!!\n\n\noh god");
    }

    let outJSON = { rows: [row0, row1] };
    console.log(JSON.stringify(outJSON));
}

function getAllCars() {
    let allCars = [];
    for (let car of saturday.cars) {
        allCars.push(simplify(car));
    }
    for (let newCar of sunday.cars) {
        let duplicate = false;
        for (let oldCar of allCars) {
            if (sameCar(oldCar, newCar)) { console.log(simplify(newCar)); duplicate = true; };
        }
        if (!duplicate) allCars.push(simplify(newCar));
    }
    for (let newCar of monday.cars) {
        let duplicate = false;
        for (let oldCar of allCars) {
            if (sameCar(oldCar, newCar)) { console.log(simplify(newCar)); duplicate = true; };
        }
        if (!duplicate) allCars.push(simplify(newCar));
    }


    let outJSON = {};
    outJSON.cars = allCars;
    console.log(JSON.stringify(outJSON));
}

function simplify(car) {
    let newCar = {};
    newCar.color = car.color;
    newCar.plate = car.plate;
    if (car.rear_view) newCar.rear_view = car.rear_view;
    if (car.stickers) newCar.stickers = car.stickers;
    return newCar;
}

function sameCar(car1, car2) {
    return car1.color == car2.color && car1.plate == car2.plate;
}

function checkSync() {
    let saturdayShorts = [];
    for (let i = 0; i < saturday.cars.length; i++) {
        const car = saturday.cars[i]
        const myString = car.color + "+" + car.plate;
        saturdayShorts.push(myString);
    }
    let sundayShorts = [];
    for (let i = 0; i < sunday.cars.length; i++) {
        const car = sunday.cars[i]
        const myString = car.color + "+" + car.plate;
        sundayShorts.push(myString);
    }
    let mondayShorts = [];
    for (let i = 0; i < monday.cars.length; i++) {
        const car = monday.cars[i]
        const myString = car.color + "+" + car.plate;
        mondayShorts.push(myString);
    }

    let firstShorts = saturdayShorts;
    let first = saturday;
    let secondShorts = sundayShorts;
    let second = sunday;
    for (let firstIndex = 0; firstIndex < firstShorts.length; firstIndex++) {
        let secondIndex = secondShorts.indexOf(firstShorts[firstIndex]);
        if (secondIndex >= 0) {
            let firstCar = first.cars[firstIndex];
            let secondCar = second.cars[secondIndex];
            let rvEqual = firstCar.rear_view == secondCar.rear_view;
            let stickerEqual = true;
            if (firstCar.stickers) {
                if (secondCar.stickers) {
                    if (firstCar.stickers.length == secondCar.stickers.length) {
                        for (let s = 0; s < firstCar.stickers.length; s++) {
                            if (firstCar.stickers[s] != secondCar.stickers[s]) { stickerEqual = false; }
                        }
                    }
                    else { stickerEqual = false; }
                } else { stickerEqual = false; }

            }
            if (!rvEqual || !stickerEqual) {
                console.log(firstCar);
                console.log(secondCar);
            }
            console.log('\n');
        }
    }
}