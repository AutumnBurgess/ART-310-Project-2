class Path {
    constructor() {
        this.segments = [];
        this.breakpoints = [];
        this.built = false;
        this.length = 0;
    }
    addSegment(segment) {
        this.segments.push(segment);
        this.built = false;
    }
    getLength() {
        if (!this.built) this.build(); //calculate length if it hasn't already
        return this.length;
    }
    //calculate breakpoints and length for the transfomration
    build() {
        //get proportions of the segment lengths, summing to one (normalized)
        const segmentLengths = this.segments.map(segment => segment.length);
        const totalLength = segmentLengths.reduce((sum, length) => sum + length);
        const normalized = segmentLengths.map(length => length / totalLength);
        //get cumulative sum to find breakpoints
        //https://stackoverflow.com/questions/20477177/creating-an-array-of-cumulative-sum-in-javascript
        const cumulativeSum = (sum => value => sum += value)(0);
        this.breakpoints = normalized.map(cumulativeSum);
        this.breakpoints.unshift(0);
        this.length = totalLength;
        this.built = true;
    }
    //display every segment as a black line
    display() {
        push();
        noFill();
        stroke(0);
        this.segments.forEach(s => s.display());
        pop();
    }
    //transform canvas with even speed accross path according to value between 0 and 1
    transform(pathScale) {
        pathScale = constrain(pathScale, 0, 1);
        if (!this.built) this.build(); //calculate breakpoints if it hasn't already
        //use transform function of segment based on calculated breakpoints
        for (let i = 0; i < this.breakpoints.length - 1; i++) {
            if (pathScale > this.breakpoints[i] && pathScale <= this.breakpoints[i + 1]) {
                //map range for segment between 0 and 1
                const segmentScale = map(pathScale, this.breakpoints[i], this.breakpoints[i + 1], 0, 1, true);
                const changes = this.segments[i].transform(segmentScale);
            }
        }
    }
}
class PathSegment {
    constructor(display, transform, length) {
        this.display = display;
        this.transform = transform;
        this.length = length;
    }
}
//a point to wait on for a given position, length, and angle
function createPoint(x, y, length = 0, angle = 0) {
    const displayF = () => {
        ellipse(x, y, 5, 5);
    };
    const transformF = (u) => {
        translate(x, y);
        rotate(angle);
    };
    return new PathSegment(displayF, transformF, length);
}
//a line between two points, rotated based on the direction of the line, plus an optional extra rotation
function createLine(x1, y1, x2, y2, addAngle = 0) {
    const angle = createVector(x2 - x1, y2 - y1).heading();
    const displayF = () => {
        line(x1, y1, x2, y2);
    };
    const transformF = (u) => {
        const x = map(u, 0, 1, x1, x2);
        const y = map(u, 0, 1, y1, y2);
        translate(x, y);
        rotate(angle + addAngle);
    };
    const length = dist(x1, y1, x2, y2);
    return new PathSegment(displayF, transformF, length);
}
//a section of a cirlce with a start angle and change in angle (clockwise is positive) constantly rotating with the arc
function createArc(x, y, radius, startAngle, theta, addAngle = 0) {
    const endAngle = startAngle + theta;
    const drawStart = theta >= 0 ? startAngle : endAngle;
    const drawEnd = theta >= 0 ? endAngle : startAngle;
    const displayF = () => {
        arc(x, y, 2 * radius, 2 * radius, drawStart, drawEnd);
    }
    const transformF = (u) => {
        const positionAngle = map(u, 0, 1, startAngle, endAngle);
        const translateX = cos(positionAngle) * radius + x;
        const translateY = sin(positionAngle) * radius + y;
        const angle = positionAngle + (theta > 0 ? HALF_PI : -HALF_PI);
        translate(translateX, translateY);
        rotate(angle + addAngle);
    }
    const length = radius * abs(theta);
    return new PathSegment(displayF, transformF, length);
}