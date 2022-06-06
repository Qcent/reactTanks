import mathLogic from "./math";

const RADS = Math.PI / 180;

const tankLogic = {
  type: { 0: { width: 30, height: 22, speed: 3, maxHealth: 100 } },
  moveY: (tank, amt) =>
    tankLogic.coordLimitCheck(tank, { yPos: tank.yPos + amt }),
  moveX: (tank, amt) =>
    tankLogic.coordLimitCheck(tank, { xPos: tank.xPos + amt }),
  rotate: (tank, pos = 1, amt = tank.speed * 1.5) =>
    tankLogic.rotateLimiter(tank.theta + amt * pos),
  rotateLimiter: (theta) => (theta > 0 ? theta % 360 : (theta + 360) % 360),
  moveAtAngle: (tank, gameState, pos = 1, amt = tank.speed) => {
    return tankLogic.coordLimitCheck(
      tank,
      {
        xPos: tank.xPos + Math.cos(tank.theta * RADS) * amt * pos,
        yPos: tank.yPos + Math.sin(tank.theta * RADS) * amt * pos,
      },
      gameState
    );
  },
  coordLimitCheck: (tank, { xPos, yPos }, gameState) => {
    if (xPos) {
      if (xPos > gameState.mapWidth - tank.width) {
        xPos = gameState.mapWidth - tank.width;
      }
      if (xPos < 0) {
        xPos = 0;
      }
    }
    if (yPos) {
      if (yPos > gameState.mapHeight - tank.height) {
        yPos = gameState.mapHeight - tank.height;
      }
      if (yPos < 0) {
        yPos = 0;
      }
    }
    return { xPos, yPos };
  },
  isOnScreen: (tank, gameState) => {
    const { xPos, yPos, tankType: type } = tank;
    const { mapXpos, mapYpos, viewPortWidth, viewPortHeight } = gameState;
    if (typeof type !== "number") return false;
    if (
      xPos > mapXpos + viewPortWidth + tankLogic.type[type].width ||
      xPos < mapXpos - tankLogic.type[type].width
    ) {
      return false;
    }

    if (
      yPos > mapYpos + viewPortHeight + tankLogic.type[type].height ||
      yPos < mapYpos - tankLogic.type[type].height
    ) {
      return false;
    }

    return true;
  },
  getFaceArray: (tank) => {
    const v = tankLogic.getVerticesMapCoOrds(tank);
    return [
      [v[0], v[1]],
      [v[1], v[2]],
      [v[2], v[3]],
      [v[3], v[0]],
    ];
  },
  getVerticesMapCoOrds: (tank) => {
    const width = tankLogic.type[tank.tankType].width,
      height = tankLogic.type[tank.tankType].height;
    // x,y of center of tank on map
    const mapCenter = [tank.xPos + width / 2, tank.yPos + height / 2];

    //calc vertices of tank rotated at theta and placed at origin of mapCenter
    const v1 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(-width / 2, -height / 2, tank.theta),
        mapCenter
      ),
      v2 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(width / 2, -height / 2, tank.theta),
        mapCenter
      ),
      v3 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(width / 2, height / 2, tank.theta),
        mapCenter
      ),
      v4 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(-width / 2, height / 2, tank.theta),
        mapCenter
      );

    return [v1, v2, v3, v4];
  },
  findNearestVertex: (tank, point, vertices) => {
    let diff = 0,
      bestMatch = -1;
    for (let i = 0; i < vertices.length; i++) {
      diff = mathLogic.aggregateDiffBetweenPoints(point, vertices[i]);
      if (i === 0 || diff < bestMatch) {
        bestMatch = i;
      }
      // conditions that returns if diff is less then some small number meaning it could be no other point
      if (diff < tank.width / 6) return i;
    }
    return bestMatch;
  },
  takeDamage: (tank, damage) => {
    tank.health -= damage;
    if (tank.health < 0) tank.health = 0;
  },
  spawn: (tank, position) => {
    const { point, theta } = position;
    tank.exploded = false;
    tank.health = tankLogic.type[tank.tankType].maxHealth;
    tank.xPos = point[0];
    tank.yPos = point[1];
    tank.theta = theta;
  },
  sharedData: ({
    id,
    username,
    tankType,
    health,
    exploded,
    xPos,
    yPos,
    theta,
    ammoType,
    fire,
    hitBy,
    joined,
  }) => {
    return {
      id,
      username,
      tankType,
      health,
      exploded,
      xPos,
      yPos,
      theta,
      ammoType,
      fire,
      hitBy,
      joined,
    };
  },
};

export default tankLogic;
