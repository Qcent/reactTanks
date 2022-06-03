import mathLogic from "./math";

const RADS = Math.PI / 180;

const bulletLogic = {
  type: { 0: { speed: 25, width: 7, height: 7, timeOut: 45 } },
  moveOB: (bullet) => {
    if (bullet)
      return {
        xPos: -bullet.width * 2,
        yPos: -bullet.height * 2,
      };
  },
  rotate: (bullet, pos = 1, amt = 1.5) =>
    bulletLogic.rotateLimiter(bullet.theta + amt * pos),
  rotateLimiter: (theta) => (theta > 0 ? theta % 360 : (theta + 360) % 360),
  moveAtAngle: (bullet) => {
    return {
      xPos:
        bullet.xPos +
        Math.cos(bullet.theta * RADS) * bulletLogic.type[bullet.type].speed,
      yPos:
        bullet.yPos +
        Math.sin(bullet.theta * RADS) * bulletLogic.type[bullet.type].speed,
    };
  },
  calcPrevCenterPoint: (bullet) => [
    bullet.xPos +
      Math.floor(bulletLogic.type[bullet.type].width / 2) -
      Math.cos(bullet.theta * RADS) * bulletLogic.type[bullet.type].speed,
    bullet.yPos +
      Math.floor(bulletLogic.type[bullet.type].width / 2) -
      Math.sin(bullet.theta * RADS) * bulletLogic.type[bullet.type].speed,
  ],
  isOnMap: (bullet, gameState) => {
    const { xPos, yPos, type } = bullet;
    if (typeof type !== "number") return false;
    if (
      xPos > gameState.mapWidth + bulletLogic.type[type].width ||
      xPos < -bulletLogic.type[type].width
    ) {
      return false;
    }

    if (
      yPos > gameState.mapHeight + bulletLogic.type[type].height ||
      yPos < -bulletLogic.type[type].height
    ) {
      return false;
    }

    return true;
  },
  collidedWithMapObject: (bullet, objectMap) => {
    const smallMeasure = bullet.width < bullet.height ? "width" : "height";
    const radius = bullet[smallMeasure] / 2,
      center = [
        bullet.xPos + Math.floor(bullet.height / 2),
        bullet.yPos + Math.floor(bullet.width / 2),
      ],
      pixelCount = bullet[smallMeasure] * bullet[smallMeasure],
      pixelRad = Math.ceil(radius);

    let pixelLog = [];
    // METHOD 1
    // Search bounding square of bullet
    const onBullet = () => {
      let x = Math.round(bullet.xPos),
        y = Math.round(bullet.yPos - 1);
      for (let i = 0; i < pixelCount; i++) {
        //if pixel is within the radius of impact "circle"
        if (mathLogic.aggregateDiffBetweenPoints(center, [x, y]) < pixelRad) {
          if (objectMap.getMapPixelXY(x, y) === 1) pixelLog.push([x, y]);
        }
        x++;
        if (i && (i - 1) % bulletLogic.type[bullet.type].width === 0) {
          y++;
          x = Math.round(bullet.xPos);
        }
      }
    };

    // METHOD 2
    // Search path of bullet center and sides

    // returning full collision path with pixel log until best method is found
    let col = false;
    const onPath = () => {
      let path = mathLogic.pixelsBetweenPoints(
        center,
        bulletLogic.calcPrevCenterPoint(bullet)
      );
      // if path is traveling to the left search through pixels in reverse order
      if (bullet.theta < 280 || bullet.theta > 90) path.reverse();
      path.forEach((point) => {
        const p = [[], point, []];
        [p[0], p[2]] = mathLogic.getRelativePerpendicularCoOrd(
          point,
          bullet.theta,
          pixelRad - 1
        );
        p.forEach(([x, y]) => {
          if (objectMap.getMapPixelXY(x, y) === 1) {
            // collide on side or center of bullet?
            col =
              objectMap.getMapPixelXY(point[0], point[1]) === 1
                ? [point[0], point[1]]
                : [x, y];
          }
          pixelLog.push([x, y]);
          // return pixelLog;
        });
      });
    };

    onPath();
    return { pixelLog, col };
    // return pixelLog?.length ? pixelLog[pixelLog.length - 1] : pixelLog;
  },

  collidedWithPolygon: (bullet, edges) => {
    const smallMeasure = bullet.width < bullet.height ? "width" : "height";
    const radius = bullet[smallMeasure] / 2,
      center = [
        bullet.xPos + Math.floor(bullet.height / 2),
        bullet.yPos + Math.floor(bullet.width / 2),
      ],
      //pixelCount = bullet[smallMeasure] * bullet[smallMeasure],
      pixelRad = Math.ceil(radius);

    let pixelLog = [];

    // Search path of bullet center and sides
    let col = false;
    const onPath = () => {
      let path = mathLogic.pixelsBetweenPoints(
        center,
        bulletLogic.calcPrevCenterPoint(bullet)
      );
      // if path is traveling to the left search through pixels in reverse order
      if (bullet.theta > 280 || bullet.theta < 90) path.reverse();
      path.forEach((point) => {
        if (!col) {
          const p = [[], point, []];
          [p[0], p[2]] = mathLogic.getRelativePerpendicularCoOrd(
            point,
            bullet.theta,
            pixelRad - 1
          );

          p.forEach(([x, y]) => {
            if (!col) {
              let inside = true;
              edges.forEach(([v1, v2]) => {
                const val = mathLogic.isRightOfPath(v1, v2, [x, y]);

                if (!val) inside = false;
              });
              if (inside) {
                col = true;
                pixelLog.push([x, y]);
              }
            }
          });
        }
      });
    };

    onPath();
    return { pixelLog, col };
    // return pixelLog?.length ? pixelLog[pixelLog.length - 1] : pixelLog;
  },
};

export default bulletLogic;
