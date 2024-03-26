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