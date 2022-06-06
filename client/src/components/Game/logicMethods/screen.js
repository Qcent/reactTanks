import mathLogic from "./math";

const RADS = Math.PI / 180;

const screenLogic = {
  moveY: (amt, mapYpos) => {
    return { mapYpos: mapYpos + amt };
  },
  moveX: (amt, mapXpos) => {
    return { mapXpos: mapXpos + amt };
  },
  moveAtAngle: ({ mapXpos, mapYpos, theta }, pos = 1, speed = 1, gameState) => {
    return screenLogic.coordLimitCheck(
      {
        mapXpos: mapXpos + Math.cos(theta * RADS) * speed * pos,
        mapYpos: mapYpos + Math.sin(theta * RADS) * speed * pos,
      },
      gameState
    );
  },
  coordLimitCheck: ({ mapXpos, mapYpos }, gameState) => {
    let [xDrift, yDrift] = [0, 0];

    if (mapXpos > gameState.mapWidth - gameState.viewPortWidth) {
      xDrift = mapXpos - (gameState.mapWidth - gameState.viewPortWidth);
      mapXpos = gameState.mapWidth - gameState.viewPortWidth;
    }
    if (mapXpos < 0) {
      xDrift = mapXpos;
      mapXpos = 0;
    }
    if (mapYpos > gameState.mapHeight - gameState.viewPortHeight) {
      yDrift = mapYpos - (gameState.mapHeight - gameState.viewPortHeight);
      mapYpos = gameState.mapHeight - gameState.viewPortHeight;
    }
    if (mapYpos < 0) {
      yDrift = mapYpos;
      mapYpos = 0;
    }
    return { mapXpos, mapYpos, drift: { x: xDrift, y: yDrift } };
  },
  randomSpawnPoint: (spawnPositions) =>
    spawnPositions[Math.floor(Math.random() * spawnPositions.length)],
  bestSpawnPoint: (tankState, spawnPositions) => {
    const minDistance = 1000;

    let farthestSpawn,
      closestViableSpawn,
      tmpClosestSpawn,
      farthestDist = 0,
      closestViableDist,
      tmpClosestDist,
      firstViable = true;

    for (let i = 0; i < spawnPositions.length; i++) {
      let notViable = false;
      for (const id in tankState) {
        if (!notViable) {
          const compTank = tankState[id];
          const dist = mathLogic.findLength(
            ...mathLogic.differenceBetweenPoints(
              [compTank.xPos, compTank.yPos],
              spawnPositions[i].point
            )
          );
          if (dist < minDistance) {
            notViable = true;
          }

          if (dist > minDistance && (firstViable || dist < closestViableDist)) {
            tmpClosestDist = dist;
            tmpClosestSpawn = i;
            firstViable = false;
          }

          if (dist > farthestDist) {
            farthestDist = dist;
            farthestSpawn = i;
          }
        }
      }
      if (!notViable) {
        closestViableDist = tmpClosestDist;
        closestViableSpawn = tmpClosestSpawn;
      }
    }

    return closestViableSpawn
      ? spawnPositions[closestViableSpawn]
      : spawnPositions[farthestSpawn];
  },
};

export default screenLogic;
