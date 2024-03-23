function createBetweenPath(x1, y1, x2, y2, laneY, radius) {
    drivePath = new Path();

    let outMovingUp = y1 > laneY; //moving up when leaving start parking spot?
    let inMovingUp = y2 < laneY; //moving up when entering end parking spot?
    let acrossMovingRight = x1 < x2; //moving to the right when moving between spots?

    //turnary operator / inline if syntax used here is: test ? valueIfTrue : valueIfFalse
    const outX = x1 + (acrossMovingRight ? -radius : radius);
    const outY = laneY + (outMovingUp ? radius : -radius);
    const outStartAngle = acrossMovingRight ? 0 : PI;
    const outTheta = outMovingUp == acrossMovingRight ? -HALF_PI : HALF_PI;
    const inX = x2 + (acrossMovingRight ? -radius : radius);
    const inY = laneY + (inMovingUp ? -radius : radius);
    const inStartAngle = inMovingUp ? HALF_PI : -HALF_PI;
    const inTheta = inMovingUp == acrossMovingRight ? -HALF_PI : HALF_PI;

    //out
    drivePath.addSegment(createLine(x1, y1, x1, outY, PI)); //adding PI so car is moves in reverse
    //turnOut
    drivePath.addSegment(createArc(outX, outY, radius, outStartAngle, outTheta, PI)); //adding PI so car moves in reverse
    //wait
    drivePath.addSegment(createPoint(outX, laneY, 50, outStartAngle))
    //across
    drivePath.addSegment(createLine(outX, laneY, inX, laneY));
    //turnIn
    drivePath.addSegment(createArc(inX, inY, radius, inStartAngle, inTheta));
    //in
    drivePath.addSegment(createLine(x2, inY, x2, y2));
    return drivePath;
}

function createEnterPath(x, y, laneY, radius) {
    drivePath = new Path();

    let inMovingUp = y < laneY; //moving up when entering end parking spot?

    //turnary operator / inline if syntax used here is: test ? valueIfTrue : valueIfFalse
    const inX = x + radius;
    const inY = laneY + (inMovingUp ? -radius : radius);
    const inStartAngle = inMovingUp ? HALF_PI : -HALF_PI;
    const inTheta = inMovingUp ? HALF_PI : -HALF_PI;

    //across
    drivePath.addSegment(createLine(width + 100, laneY, inX, laneY));
    //turnIn
    drivePath.addSegment(createArc(inX, inY, radius, inStartAngle, inTheta));
    //in
    drivePath.addSegment(createLine(x, inY, x, y));
    return drivePath;
}

function createExitPath(x, y, laneY, radius) {
    drivePath = new Path();

    let outMovingUp = y > laneY; //moving up when leaving start parking spot?

    //turnary operator / inline if syntax used here is: test ? valueIfTrue : valueIfFalse
    const outX = x - radius;
    const outY = laneY + (outMovingUp ? radius : -radius);
    const outStartAngle = 0;
    const outTheta = outMovingUp ? -HALF_PI : HALF_PI;
    //out
    drivePath.addSegment(createLine(x, y, x, outY, PI)); //adding PI so car is moves in reverse
    //turnOut
    drivePath.addSegment(createArc(outX, outY, radius, outStartAngle, outTheta, PI)); //adding PI so car moves in reverse
    //wait
    drivePath.addSegment(createPoint(outX, laneY, 50, outStartAngle))
    //across
    drivePath.addSegment(createLine(outX, laneY, width + 100, laneY));
    return drivePath;
}