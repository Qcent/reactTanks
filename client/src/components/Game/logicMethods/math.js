const RADS = Math.PI / 180;

const mathLogic = {
  findLength: (x, y) => Math.sqrt(x * x + y * y),
  slopeToAngle: (slope) => Math.atan(slope) / RADS,
  rotateVirtex: (x, y, theta) => [
    x * Math.cos(theta * RADS) - y * Math.sin(theta * RADS),
    y * Math.cos(theta * RADS) + x * Math.sin(theta * RADS),
  ],
  translateVirtex: (point, newOrigin) => [
    (point[0] += newOrigin[0]),
    (point[1] += newOrigin[1]),
  ],
  differenceBetweenPoints: (p1, p2) => [
    Math.abs(p1[0] - p2[0]),
    Math.abs(p1[1] - p2[1]),
  ],
  aggregateDiffBetweenPoints: (p1, p2) =>
    Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]),
  getRelativePerpendicularCoOrd: (point, theta, dist) => {
    theta += 90;
    const [x, y] = [
      Math.floor(Math.cos(theta * RADS) * dist),
      Math.floor(Math.sin(theta * RADS) * dist),
    ];

    return [
      [point[0] + x, point[1] + y],
      [point[0] - x, point[1] - y],
    ];
  },
  pixelsBetweenPoints: (p1, p2) => {
    const slope = (p1[1] - p2[1]) / (p1[0] - p2[0]),
      length = mathLogic.findLength(
        Math.abs(p1[0] - p2[0]),
        Math.abs(p1[1] - p2[1])
      ),
      yLength = Math.abs(p1[1] - p2[1]);

    let pixels = [];
    const [startX, startY, endX] =
        p1[0] < p2[0]
          ? [Math.round(p1[0]), Math.round(p1[1]), Math.round(p2[0])]
          : [Math.round(p2[0]), Math.round(p2[1]), Math.round(p1[0])],
      highY = p1[1] < p2[1] ? Math.round(p1[1]) : Math.round(p2[1]);
    const dataPoints = endX - startX,
      minDataPoints = Math.ceil(length / 4),
      extraPoints = minDataPoints - dataPoints,
      xOffset = dataPoints / minDataPoints,
      extraValue = yLength / minDataPoints;

    if (extraPoints > 0) {
      for (let i = 0; i < minDataPoints; i++) {
        pixels.push([
          startX + Math.floor(i * xOffset),
          startY === highY
            ? startY + Math.round(extraValue * i)
            : startY - Math.round(extraValue * i),
        ]);
      }
    } else {
      for (let i = 0; i < endX - startX; i++) {
        pixels.push([startX + i, startY + Math.round(slope * i)]);
      }
    }

    return pixels;
  },
  isRightOfPath: (v1, v2, p) =>
    (p[1] - v1[1]) * (v2[0] - v1[0]) - (p[0] - v1[0]) * (v2[1] - v1[1]) >= 0,
  pointVsPath: (v1, v2, p) =>
    // returns: <0 if point has not crossed path,
    //          0 if point is on path,
    //          >0 if point has crossed path
    (p[1] - v1[1]) * (v2[0] - v1[0]) - (p[0] - v1[0]) * (v2[1] - v1[1]),
  didPolygonsCollide: (poly1, poly2) => {
    // polygon obj = {sides:[[x,y],[x2,y2]],points:[[x,y]]}
    // compare every vertex of poly 1 against the sides of poly2

    let col = false,
      retVal1 = [],
      retVal2 = [];
    poly1.points.forEach((point) => {
      if (1 || !col) {
        //console.log("checking point: ", point);
        let inside = true,
          values = [];
        poly2.sides.forEach(([p1, p2]) => {
          if (inside) {
            // console.log("\t against side: ", p1, p2);
            const val = mathLogic.pointVsPath(p1, p2, point);
            values.push(val);
            // console.log("\t\t value: ", val);
            if (val < 0) {
              //console.log("point: ", point, " is NOT in poly2");
              inside = false;
            }
          }
        });
        if (inside) {
          //console.log("point: ", point, " IS in poly2");
          col = true;
          retVal1.push(values);
        }
      }
    });

    // then test poly2 verticies agains poly1 sides
    poly2.points.forEach((point) => {
      if (1 || !col) {
        //console.log("checking point: ", point);
        let inside = true,
          values = [];
        poly1.sides.forEach(([p1, p2]) => {
          if (inside) {
            // console.log("\t against side: ", p1, p2);
            const val = mathLogic.pointVsPath(p1, p2, point);
            values.push(val);
            // console.log("\t\t value: ", val);
            if (val < 0) {
              //console.log("point: ", point, " is NOT in poly1");
              inside = false;
            }
          }
        });
        if (inside) {
          //console.log("point: ", point, " IS in poly1");
          col = true;
          retVal2.push(values);
        }
      }
    });

    return { col, poly1: retVal1, poly2: retVal2 };
  },
};

export default mathLogic;
