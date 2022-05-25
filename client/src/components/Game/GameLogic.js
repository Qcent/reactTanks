import { useEffect } from "react";

const RADS = Math.PI / 180;

// logic helpers

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
};

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
};

const tankLogic = {
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
  getVerticesMapCoOrds: (tank) => {
    // x,y of center of tank on map
    const mapCenter = [tank.xPos + tank.width / 2, tank.yPos + tank.height / 2];

    //calc vertices of tank rotated at theta and placed at origin of mapCenter
    const v1 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(-tank.width / 2, -tank.height / 2, tank.theta),
        mapCenter
      ),
      v2 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(tank.width / 2, -tank.height / 2, tank.theta),
        mapCenter
      ),
      v3 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(tank.width / 2, tank.height / 2, tank.theta),
        mapCenter
      ),
      v4 = mathLogic.translateVirtex(
        mathLogic.rotateVirtex(-tank.width / 2, tank.height / 2, tank.theta),
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
};

const explosionLogic = {
  type: { 0: { duration: 180, size: 19 } },
  arrayReducer: (explosions) =>
    explosions.reduce(function (filtered, explosion) {
      if (explosion.step < explosionLogic.type[explosion.type].duration) {
        filtered.push({
          ...explosion,
          step: explosion.step + 1,
          particles: explosionLogic.getAnimatedParticles(explosion),
        });
      }
      return filtered;
    }, []),
  getAnimatedParticles: (exp) => {
    const { xPos, yPos, step } = exp;
    const { size, duration } = explosionLogic.type[exp.type];
    if (step > duration) return;
    let pointMap = [];
    pointMap.push(
      ...mathLogic.pixelsBetweenPoints(
        mathLogic.translateVirtex(mathLogic.rotateVirtex(-size, 0, step + 1), [
          xPos,
          yPos,
        ]),
        mathLogic.translateVirtex(mathLogic.rotateVirtex(size, 0, step + 1), [
          xPos,
          yPos,
        ])
      ),

      ...mathLogic.pixelsBetweenPoints(
        mathLogic.translateVirtex(mathLogic.rotateVirtex(0, -size, step + 1), [
          xPos,
          yPos,
        ]),
        mathLogic.translateVirtex(mathLogic.rotateVirtex(0, size, step + 1), [
          xPos,
          yPos,
        ])
      )
    );
    return pointMap;
  },
};

const bulletLogic = {
  type: { 0: { speed: 25, width: 9, height: 9 } },
  // arrayReducer: (bullets) =>
  //   bullets.reduce(function (filtered, bullet, state) {
  //     if (bulletLogic.isOnScreen(bullet, state)) {
  //       bullet = { ...bullet, ...bulletLogic.moveAtAngle(bullet) };
  //       const collisionData = bulletLogic.collidedWithMapObject(
  //         bullet,
  //         mapObjects
  //       );

  //       if (collisionData.length) {
  //         // want this to be the center of the path where first incountered obstical
  //         // currently center of bullet at logic cycle
  //         const center = [
  //           bullet.xPos + Math.floor(bulletLogic.type[bullet.type].width / 2),
  //           bullet.yPos + Math.floor(bulletLogic.type[bullet.type].width / 2),
  //         ];
  //         newState.explosionArray.push({
  //           type: 0,
  //           xPos: center[0],
  //           yPos: center[1],
  //           step: 0,
  //         });
  //         bullet = { ...bullet, ...bulletLogic.moveOB(bullet) };
  //       }
  //       filtered.push(bullet);
  //     }
  //     return filtered;
  //   }, []),
  moveOB: (bullet) => {
    return {
      xPos: -bulletLogic.type[bullet.type].width * 2,
      yPos: -bulletLogic.type[bullet.type].height * 2,
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
  isOnScreen: (bullet, gameState) => {
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
    const radius = bulletLogic.type[bullet.type].width / 2,
      center = [
        bullet.xPos + Math.floor(bulletLogic.type[bullet.type].width / 2),
        bullet.yPos + Math.floor(bulletLogic.type[bullet.type].width / 2),
      ],
      pixelCount =
        bulletLogic.type[bullet.type].width *
        bulletLogic.type[bullet.type].width,
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
    const onPath = () => {
      mathLogic
        .pixelsBetweenPoints(center, bulletLogic.calcPrevCenterPoint(bullet))
        .map((point) => {
          const p = [[], point, []];
          [p[0], p[2]] = mathLogic.getRelativePerpendicularCoOrd(
            point,
            bullet.theta,
            pixelRad - 1
          );
          p.forEach(([x, y]) => {
            if (objectMap.getMapPixelXY(x, y) === 1) pixelLog.push([x, y]);
            return pixelLog;
          });
        });
    };

    onPath();
    return pixelLog?.length ? pixelLog[pixelLog.length - 1] : pixelLog;
  },
};

const GameLogic = ({
  inputState,
  gameState,
  setGameState,
  tankState,
  setTankState,
  readyState,
  setReadyState,
  mapObjects,
}) => {
  // Lifecycle

  useEffect(() => {
    if (readyState) {
      // do stuff

      let newState = { ...gameState };
      let newTanks = { ...tankState };
      const { me } = tankState;
      let updateMe = false;
      let updateGame = false;

      //handle inputs

      if (inputState["ArrowLeft"]) {
        newTanks.me.theta = tankLogic.rotate(me, -1);
        updateMe = true;
      }
      if (inputState["ArrowRight"]) {
        newTanks.me.theta = tankLogic.rotate(me);
        updateMe = true;
      }
      if (inputState["ArrowUp"]) {
        newTanks.me = {
          ...newTanks.me,
          ...tankLogic.moveAtAngle(me, gameState),
          direction: 1,
        };
        updateMe = true;
      }
      if (inputState["ArrowDown"]) {
        newTanks.me = {
          ...newTanks.me,
          ...tankLogic.moveAtAngle(me, gameState, -1),
          direction: -1,
        };
        updateMe = true;
      }
      //movement check
      if (
        newTanks.me.direction !== 0 &&
        !inputState["ArrowUp"] &&
        !inputState["ArrowDown"]
      ) {
        newTanks.me = { ...newTanks.me, direction: 0 };
        updateMe = true;
      }

      /* TOGGLE BUTTONS */
      // cruise mode
      if (inputState["q"] && !newState.cruiseModeChange) {
        newState.cruiseMode = !gameState.cruiseMode;
        newState.cruiseModeChange = true;
        updateGame = true;
      }
      if (newState.cruiseModeChange && !inputState["q"]) {
        newState.cruiseModeChange = false;
        updateGame = true;
      }

      // fire bullet
      if (inputState[" "] && !newTanks.me.pressedFireButton) {
        newTanks.me.fire = true;
        newTanks.me.pressedFireButton = true;
        updateMe = true;
      }
      if (newTanks.me.pressedFireButton && !inputState[" "]) {
        newTanks.me.pressedFireButton = false;
        updateMe = true;
      }

      // END OF INPUTS

      // handle onscreen position of tank
      if (newState.cruiseMode) {
        // keep screen centered on tank
        const middleX = gameState.viewPortWidth / 2 - me.width / 2;
        const middleY = gameState.viewPortHeight / 2 - me.height / 2;
        const targetXDif = middleX - newTanks.me.screenX;
        const targetYDif = middleY - newTanks.me.screenY;
        const totalDist = mathLogic.findLength(targetXDif, targetYDif);

        if (totalDist < 5 && (updateMe || updateGame)) {
          // centered tank
          updateMe = updateGame = true;
          const { mapXpos, mapYpos, drift } = screenLogic.coordLimitCheck(
            {
              mapXpos: newTanks.me.xPos - middleX,
              mapYpos: newTanks.me.yPos - middleY,
            },
            gameState
          );
          newTanks.me = {
            ...newTanks.me,
            screenX: middleX + drift.x,
            screenY: middleY + drift.y,
          };
          newState = {
            ...newState,
            mapXpos,
            mapYpos,
          };
        } else if (totalDist > 0) {
          // progress towards a centered tank
          const speed =
            totalDist / 8 < gameState.tankSpeed * 1.5
              ? totalDist < 2
                ? totalDist
                : gameState.tankSpeed * 1.5
              : totalDist / 8;
          const { mapXpos, mapYpos } = screenLogic.moveAtAngle(
            {
              theta: mathLogic.slopeToAngle(targetYDif / targetXDif),
              mapXpos: newState.mapXpos,
              mapYpos: newState.mapYpos,
            },
            targetXDif < 0 ? 1 : -1, //direction of travel
            speed,
            gameState
          );
          const screenX = parseFloat((newTanks.me.xPos - mapXpos).toFixed(1));
          const screenY = parseFloat((newTanks.me.yPos - mapYpos).toFixed(1));

          if (screenX !== me.screenX || screenY !== me.screenY) {
            updateMe = true;
            newTanks.me = {
              ...newTanks.me,
              screenX,
              screenY,
            };
          }

          if (mapXpos !== newState.mapXpos || mapYpos !== newState.mapYpos) {
            updateGame = true;
            newState = {
              ...newState,
              mapXpos,
              mapYpos,
            };
          }
        }
      } else if (updateMe || updateGame) {
        // Battle Mode
        // tank drives around screen, dragging screen with it when at buffered edge
        updateMe = true;
        const buffer = 30;
        const maxX = gameState.viewPortWidth - buffer - me.width;
        const maxY = gameState.viewPortHeight - buffer - me.height;
        const [minX, minY] = [buffer, buffer];
        let { mapXpos, mapYpos } = newState;
        let bufferUpdate = false;
        let screenX = newTanks.me.xPos - mapXpos;
        let screenY = newTanks.me.yPos - mapYpos;

        //drag screen if needed
        if (
          screenX > maxX &&
          mapXpos < gameState.mapWidth - gameState.viewPortWidth
        ) {
          mapXpos -= maxX - screenX;
          screenX = maxX;
          bufferUpdate = true;
        } else if (screenX < buffer && mapXpos > 0) {
          mapXpos -= minX - screenX;
          screenX = minX;
          bufferUpdate = true;
        }

        if (
          screenY > maxY &&
          mapYpos < gameState.mapHeight - gameState.viewPortHeight
        ) {
          mapYpos -= maxY - screenY;
          screenY = maxY;
          bufferUpdate = true;
        } else if (screenY < minY && mapYpos > 0) {
          mapYpos -= minY - screenY;
          screenY = minY;
          bufferUpdate = true;
        }

        newTanks.me = {
          ...newTanks.me,
          screenX,
          screenY,
        };

        if (bufferUpdate) {
          updateGame = true;
          newState = {
            ...newState,
            ...screenLogic.coordLimitCheck({ mapXpos, mapYpos }, gameState),
          };
        }
        //end of battle mode
      }
      // END OF ONSCREEN POSITION

      // handle bullet firing, positions and collisons

      newState.bulletArray = newState.bulletArray
        .filter((bullet) => bulletLogic.isOnScreen(bullet, newState))
        .map((bullet) => {
          bullet = { ...bullet, ...bulletLogic.moveAtAngle(bullet) };
          const collisionData = bulletLogic.collidedWithMapObject(
            bullet,
            mapObjects
          );

          if (collisionData.length) {
            // want this to be the center of the path where first incountered obstical
            // currently center of bullet at logic cycle
            const center = [collisionData[0], collisionData[1]];
            // const center = [
            //   bullet.xPos + Math.floor(bulletLogic.type[bullet.type].width / 2),
            //   bullet.yPos + Math.floor(bulletLogic.type[bullet.type].width / 2),
            // ];
            newState.explosionArray.push({
              type: 0,
              xPos: center[0],
              yPos: center[1],
              step: 0,
            });
            bullet = { ...bullet, ...bulletLogic.moveOB(bullet) };
          }

          return bullet;
        });

      if (newTanks.me.fire) {
        newState.bulletArray.push({
          type: 0,
          xPos:
            newTanks.me.xPos +
            newTanks.me.width / 2 -
            bulletLogic.type["0"].width / 2,
          yPos:
            newTanks.me.yPos +
            newTanks.me.height / 2 -
            bulletLogic.type["0"].height / 2,
          theta: newTanks.me.theta,
        });
        newTanks.me.fire = false;
      }

      // END OF BULLET POSITION/COLLISION/FIRING

      // handle explosion animation / destruction
      newState.explosionArray = explosionLogic.arrayReducer(
        newState.explosionArray
      );
      // END OF EXPLOSION ANIMATION/DESTRUCTION

      //collision detection
      if (updateMe) {
        const v = tankLogic.getVerticesMapCoOrds(newTanks.me);
        const [left, front, right, back] = [
          mathLogic.pixelsBetweenPoints(v[0], v[1]),
          mathLogic.pixelsBetweenPoints(v[1], v[2]),
          mathLogic.pixelsBetweenPoints(v[2], v[3]),
          mathLogic.pixelsBetweenPoints(v[0], v[3]),
        ];

        //testing outline
        newTanks.me.colLine = [...left, ...front, ...right, ...back];

        // % of pixels that represent a corner of a collision side.
        const cornerPercent = 0.17;
        const impactData = {
          v: {},
        };

        //////////////////////
        //function
        const getImpactData = (tank, face, v, axis, cornerData) => {
          const stats = { pixels: 0 };

          for (let i = 1; i < face.length - 1; i++) {
            if (mapObjects.getMapPixelXY(face[i][0], face[i][1])) {
              stats.pixels++;

              if (
                i / (face.length - 1) < cornerPercent ||
                1 - i / (face.length - 1) < cornerPercent
              ) {
                //if close enough to first or second corner pixels
                const vertex = tankLogic.findNearestVertex(tank, face[i], v);
                cornerData[vertex]
                  ? cornerData[vertex][axis]
                    ? cornerData[vertex][axis]++
                    : (cornerData[vertex][axis] = 1)
                  : (cornerData[vertex] = { [axis]: 1 });
              }
            }
          }
          stats.hitsPosible = face.length - 2;
          stats.hitPercent = stats.pixels / stats.hitsPosible;
          return stats;
        };
        //////////////////////
        // an immediately invoked function that will stop tank in crash by returning true or
        // deflect tank if grazing a wall and returning false
        if (
          (() => {
            //front
            impactData.front = getImpactData(
              newTanks.me,
              front,
              v,
              "travelAxis",
              impactData.v
            );
            //back
            impactData.back = getImpactData(
              newTanks.me,
              back,
              v,
              "travelAxis",
              impactData.v
            );
            //left
            impactData.left = getImpactData(
              newTanks.me,
              left,
              v,
              "sideAxis",
              impactData.v
            );
            //right
            impactData.right = getImpactData(
              newTanks.me,
              right,
              v,
              "sideAxis",
              impactData.v
            );

            //head on crash
            if (
              newTanks.me.direction > 0 &&
              impactData.front.hitPercent > cornerPercent
            ) {
              //console.log("HeadOn Crash");
              //console.log(impactData);
              return true;
            }
            if (
              newTanks.me.direction < 0 &&
              impactData.back.hitPercent > cornerPercent
            ) {
              //console.log("RearOn Crash");
              //console.log(impactData);
              return true;
            }
            //defelection
            let defelection = false,
              twist = 0;
            const twistFactor = 1.75;
            // side back left corner bump
            if (impactData?.v[0]?.sideAxis) {
              twist -= impactData?.v[0]?.sideAxis;
              if (impactData.left.hitPercent < cornerPercent)
                defelection = true;
            }
            // side front left corner bump
            if (impactData?.v[1]?.sideAxis) {
              twist += impactData?.v[1]?.sideAxis;
              if (impactData.left.hitPercent < cornerPercent)
                defelection = true;
            }

            // side back right corner bump
            if (impactData?.v[3]?.sideAxis) {
              twist += impactData?.v[3]?.sideAxis;
              if (impactData.right.hitPercent < cornerPercent)
                defelection = true;
            }
            // side front right corner bump
            if (impactData?.v[2]?.sideAxis) {
              twist -= impactData?.v[2]?.sideAxis;
              if (impactData.right.hitPercent < cornerPercent)
                defelection = true;
            }

            // travel front left corner bump
            if (impactData?.v[1]?.travelAxis) {
              twist += impactData?.v[1]?.travelAxis;
              if (impactData.front.hitPercent < cornerPercent)
                defelection = true;
            }
            // travel front right corner bump
            if (impactData?.v[2]?.travelAxis) {
              twist -= impactData?.v[2]?.travelAxis;
              if (impactData.front.hitPercent < cornerPercent)
                defelection = true;
            }

            // travel back left corner bump
            if (impactData?.v[0]?.travelAxis) {
              twist += impactData?.v[0]?.travelAxis;
              if (impactData.back.hitPercent < cornerPercent)
                defelection = true;
            }
            // travel back right corner bump
            if (impactData?.v[3]?.travelAxis) {
              twist -= impactData?.v[3]?.travelAxis;
              if (impactData.back.hitPercent < cornerPercent)
                defelection = true;
            }

            if (twist !== 0) {
              //console.log("Twist: ", twist);
              newTanks.me.theta = tankLogic.rotate(
                newTanks.me,
                1,
                twist * twistFactor
              );
            }

            //left side push
            if (
              impactData.left.hitPercent > 0 &&
              impactData.left.hitPercent > impactData.right.hitPercent
            ) {
              newTanks.me = {
                ...newTanks.me,
                ...tankLogic.moveAtAngle(
                  {
                    xPos: newTanks.me.xPos,
                    yPos: newTanks.me.yPos,
                    theta: newTanks.me.theta + 90,
                  },
                  newState,
                  1,
                  1
                ),
              };

              //console.log("Push Right");
              defelection = true;
            }

            //right side push
            if (
              impactData.right.hitPercent > 0 &&
              impactData.right.hitPercent > impactData.left.hitPercent
            ) {
              newTanks.me = {
                ...newTanks.me,
                ...tankLogic.moveAtAngle(
                  {
                    xPos: newTanks.me.xPos,
                    yPos: newTanks.me.yPos,
                    theta: newTanks.me.theta + 90,
                  },
                  newState,
                  -1,
                  1
                ),
              };

              //console.log("Push Left");
              defelection = true;
            }

            //logging
            if (
              impactData?.front.pixels ||
              impactData?.back.pixels ||
              impactData?.left.pixels ||
              impactData?.right.pixels
            ) {
              console.log(impactData);
              return !defelection;
            }
            ////////////////////
            return false;
          })()
        ) {
          updateMe = updateGame = false;
        }
      }

      // Update Tank and Game State
      if (updateMe) setTankState({ ...newTanks });
      if (updateGame) setGameState({ ...newState });
      else
        setGameState({
          ...gameState,
          bulletArray: newState.bulletArray,
          explosionArray: newState.explosionArray,
        });

      //debugging output
      if (updateMe) {
      }
      // end logic cycle
      setReadyState(false);
    }
  }, [
    inputState,
    gameState,
    setGameState,
    tankState,
    setTankState,
    readyState,
    setReadyState,
    mapObjects,
  ]);

  return null;
};

export default GameLogic;
