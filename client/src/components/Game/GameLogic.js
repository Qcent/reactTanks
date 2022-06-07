import { useEffect } from "react";

// logic helpers
import {
  mathLogic,
  screenLogic,
  tankLogic,
  bulletLogic,
  explosionLogic,
} from "./logicMethods";

const GameLogic = ({
  inputState,
  gameState,
  setGameState,
  tankState,
  setTankState,
  readyState,
  setReadyState,
  mapObjects,
  emitTankData,
  tankUpdates,
  setTankUpdates,
}) => {
  const newTickerItem = (txt, tickerArray, duration = 400) => {
    tickerArray.push({
      txt,
      duration,
      step: 0,
    });
  };
  const tickerReducer = (tickerArray) =>
    tickerArray.reduce((filtered, item) => {
      if (item.step < item.duration) {
        filtered.push({
          ...item,
          step: item.step + 1,
        });
      }
      return filtered;
    }, []);

  // Lifecycle

  useEffect(() => {
    if (readyState) {
      // do stuff

      let newState = { ...gameState };
      let newTanks = { ...tankState };
      const { me } = tankState;
      let updateMe = false,
        updateGame = false,
        updateTanks = false,
        didFire = false;

      if (me.xPos === -1 && me.yPos === -1) {
        tankLogic.spawn(
          newTanks.me,
          screenLogic.randomSpawnPoint(gameState.spawnPositions)
        );
        newTanks.me.joined = true;
        updateMe = true;
      }

      // update other tanks from received net data
      if (Object.keys(tankUpdates).length) {
        updateTanks = true;
        newTanks = { ...newTanks, ...tankUpdates };
        setTankUpdates({});
      }

      // position at spawn point right before the timeout ends
      if (newState.reSpawnTimeOut === 25) {
        newState.cruiseMode = true;
        newState.killStreak = 0;
        tankLogic.spawn(
          newTanks.me,
          screenLogic.bestSpawnPoint(newTanks, gameState.spawnPositions)
        );
        updateMe = updateGame = true;
      }

      //handle inputs
      if (!newState.reSpawnTimeOut) {
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
        if (inputState["x"] && !newState.cruiseModeChange) {
          newState.cruiseMode = !gameState.cruiseMode;
          newState.cruiseModeChange = true;
          updateGame = true;
        }
        if (newState.cruiseModeChange && !inputState["x"]) {
          newState.cruiseModeChange = false;
          updateGame = true;
        }

        // show Stats
        if (inputState["s"] && !newState.showStatsChange) {
          newState.showStats = !gameState.showStats;
          newState.showStatsChange = true;
          updateGame = true;
        }
        if (newState.showStatsChange && !inputState["s"]) {
          newState.showStatsChange = false;
          updateGame = true;
        }

        // Name display 3 setting toggle
        if (inputState["z"] && !newState.nameDisplayChange) {
          //newState.nameDisplay = !gameState.nameDisplay;
          newState.nameDisplay = gameState.nameDisplay
            ? gameState.nameDisplay < 2
              ? gameState.nameDisplay + 1
              : 0
            : 1;
          newState.nameDisplayChange = true;
          updateGame = true;
        }
        if (newState.nameDisplayChange && !inputState["z"]) {
          newState.nameDisplayChange = false;
          updateGame = true;
        }

        // Health display 3 setting toggle
        if (inputState["c"] && !newState.healthDisplayChange) {
          newState.healthDisplay = gameState.healthDisplay
            ? gameState.healthDisplay < 2
              ? gameState.healthDisplay + 1
              : 0
            : 1;
          newState.healthDisplayChange = true;
          updateGame = true;
        }
        if (newState.healthDisplayChange && !inputState["c"]) {
          newState.healthDisplayChange = false;
          updateGame = true;
        }
      }

      // fire bullet

      if (
        !newState.fireTimeOut &&
        inputState[" "] &&
        !newTanks.me.pressedFireButton
      ) {
        newTanks.me.fire = true;
        newTanks.me.pressedFireButton = true;
        didFire = true;
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
      // tank collision detection
      const v = tankLogic.getVerticesMapCoOrds(newTanks.me);
      if (updateMe) {
        const [left, front, right, back] = [
          mathLogic.pixelsBetweenPoints(v[0], v[1]),
          mathLogic.pixelsBetweenPoints(v[1], v[2]),
          mathLogic.pixelsBetweenPoints(v[2], v[3]),
          mathLogic.pixelsBetweenPoints(v[0], v[3]),
        ];

        //testing outline
        //newTanks.me.colLine = [...left, ...front, ...right, ...back];

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

            if (
              impactData?.front.pixels ||
              impactData?.back.pixels ||
              impactData?.left.pixels ||
              impactData?.right.pixels
            ) {
              //console.log(impactData);
              return !defelection;
            }
            ////////////////////
            return false;
          })()
        ) {
          newTanks.me = { ...me, fire: newTanks.me.fire };
          updateGame = false;
        }
      }
      // END OF TANK COLLISION DETECTION

      // handle bullet positions and collisons tank death, explosion creation
      let hitBy = false;
      newState.bulletArray = newState.bulletArray.reduce((filtered, bullet) => {
        if (bulletLogic.isOnMap(bullet, newState)) {
          bullet = { ...bullet, ...bulletLogic.moveAtAngle(bullet) };
          const mapCollisionData = bulletLogic.collidedWithMapObject(
            bullet,
            mapObjects
          );
          const myCollisionData =
            bullet.owner !== me.id && !newTanks.me.exploded
              ? bulletLogic.collidedWithPolygon(
                  bullet,
                  tankLogic.getFaceArray(newTanks.me)
                )
              : {};

          // hit prediction creates list of assumed hits to be confirmed from self reporting tank
          const otherTanksCollisionData = Object.keys(newTanks).map((id) => {
            const tank = newTanks[id];
            return !tank.exploded &&
              tank.id !== me.id &&
              bullet.owner !== tank.id
              ? bulletLogic.collidedWithPolygon(
                  bullet,
                  tankLogic.getFaceArray(tank)
                )
              : false;
          });
          //create an explosion and add hit to assumed hit list
          otherTanksCollisionData.forEach((colData) => {
            if (colData.col) {
              newState.assumedHits.push({
                owner: bullet.owner,
                id: bullet.id,
                point: [colData.pixelLog[0][0], colData.pixelLog[0][1]],
              });
              newState.explosionArray.push({
                type: 0,
                xPos: colData.pixelLog[0][0],
                yPos: colData.pixelLog[0][1],
                step: 0,
                duration: explosionLogic.type["0"].duration,
              });
              bullet = { ...bullet, ...bulletLogic.moveOB(bullet) };
            }
          });
          // END OF HIT PREDICTION

          // if (myCollisionData.pixelLog.length) {
          //   newTanks.me.colLine = myCollisionData.pixelLog;
          // }
          if (mapCollisionData.col) {
            newState.explosionArray.push({
              type: 0,
              xPos: mapCollisionData.col[0],
              yPos: mapCollisionData.col[1],
              // xPos: mapCollisionData[0],
              // yPos: mapCollisionData[1],
              step: 0,
              duration: explosionLogic.type["0"].duration,
            });
            bullet = { ...bullet, ...bulletLogic.moveOB(bullet) };
          }
          if (myCollisionData.col) {
            updateMe = true;
            tankLogic.takeDamage(
              newTanks.me,
              bulletLogic.type[bullet.type].damage
            );
            if (!newTanks.me.health) {
              newState.deaths ? newState.deaths++ : (newState.deaths = 1);
              newState.deathStreak
                ? newState.deathStreak++
                : (newState.deathStreak = 1);
              if (newState.deathStreak > newState.longestDeathStreak)
                newState.longestDeathStreak = newState.deathStreak;
              newTickerItem(
                `${newTanks[bullet.owner].username} killed ${me.username}`,
                newState.gameTicker
              );
            }
            hitBy = {
              owner: bullet.owner,
              id: bullet.id,
              point: [
                myCollisionData.pixelLog[0][0],
                myCollisionData.pixelLog[0][1],
              ],
            };
            newState.explosionArray.push({
              type: 0,
              xPos: myCollisionData.pixelLog[0][0],
              yPos: myCollisionData.pixelLog[0][1],
              step: 0,
              duration: explosionLogic.type["0"].duration,
            });
            bullet = { ...bullet, ...bulletLogic.moveOB(bullet) };
          }
          filtered.push(bullet);
        }
        return filtered;
      }, []);

      //handle bullet firing for local tank
      if (newTanks.me.fire) {
        newState.shotsFired ? newState.shotsFired++ : (newState.shotsFired = 1);
        newState.bulletArray.push({
          type: 0,
          owner: me.id,
          id: newState.shotsFired,
          xPos:
            newTanks.me.xPos +
            newTanks.me.width / 2 -
            bulletLogic.type["0"].width / 2,
          yPos:
            newTanks.me.yPos +
            newTanks.me.height / 2 -
            bulletLogic.type["0"].height / 2,
          theta: newTanks.me.theta,
          width: bulletLogic.type[newTanks.me.ammoType].width,
          height: bulletLogic.type[newTanks.me.ammoType].height,
        });
        newTanks.me.fire = false;
        newState.fireTimeOut = bulletLogic.type[newTanks.me.ammoType].timeOut;
      }

      // loop through all tanks for spawn/death and other tanks for firing and reported hits
      for (const tank in newTanks) {
        /* EXPERIMANTAL POLY ON POLY (TANK/TANK) COLLISIONS */
        if (tank !== "me") {
          const colDat = mathLogic.didPolygonsCollide(
            tankLogic.getPolygon(newTanks.me),
            tankLogic.getPolygon(newTanks[tank])
          );

          if (colDat.col) {
            console.log("we got a tank collision ");

            let colPoints = colDat.poly1.map((dats) =>
              tankLogic.convertPolygonCollisionDataToTankMapCoordinate(
                dats,
                newTanks[tank]
              )
            );
            newTanks.me.colLine = [
              ...colPoints,
              ...(colPoints = colDat.poly2.map((dats) =>
                tankLogic.convertPolygonCollisionDataToTankMapCoordinate(
                  dats,
                  newTanks["me"]
                )
              )),
            ];
          }
        }
        /* END OF EXPERIMANTAL POLY ON POLY (TANK/TANK) COLLISIONS */

        // Spawn Of A Tank
        if (
          !newTanks[tank].exploded &&
          newState.inactiveTanks?.includes(tank)
        ) {
          newState.inactiveTanks.splice(
            newState.inactiveTanks.findIndex((id) => id === tank),
            1
          );
          updateTanks = true;
          newTickerItem(
            `${newTanks[tank].username} has respawned`,
            newState.gameTicker
          );
        } else if (newTanks[tank].joined) {
          updateTanks = true;
          newTickerItem(
            `${newTanks[tank].username} has joined the game`,
            newState.gameTicker
          );
          if (tank !== "me") delete newTanks[tank].joined;
        }
        // END OF SPAWN A TANK

        // Death Of A Tank
        if (
          newTanks[tank].id === me.id &&
          !newTanks[tank].exploded &&
          !newTanks[tank].health
        ) {
          newState.reSpawnTimeOut = 300;
          newTanks[tank].exploded = true;
        }

        if (
          newTanks[tank].exploded &&
          !newState.inactiveTanks?.includes(tank)
        ) {
          if (tank !== "me") {
            let killer = newTanks[tank].hitBy.owner;
            if (killer === me.id) {
              killer = "me";
              newState.shotsHit ? newState.shotsHit++ : (newState.shotsHit = 1);
              newState.enemyKills
                ? newState.enemyKills++
                : (newState.enemyKills = 1);
              newState.killStreak
                ? newState.killStreak++
                : (newState.killStreak = 1);
              if (newState.killStreak > newState.longestKillStreak)
                newState.longestKillStreak = newState.killStreak;
              newState.deathStreak = 0;
            }
            newTickerItem(
              `${newTanks[killer].username} killed ${newTanks[tank].username}`,
              newState.gameTicker
            );
          }

          // remove tank from play
          newState.inactiveTanks.push(tank);
          // make explosion
          const center = [
            newTanks[tank].xPos +
              tankLogic.type[newTanks[tank].tankType].width / 2,
            newTanks[tank].yPos +
              tankLogic.type[newTanks[tank].tankType].height / 2,
          ];
          newState.explosionArray.push({
            type: 1,
            xPos: center[0],
            yPos: center[1],
            step: 0,
            duration: explosionLogic.type["1"].duration,
          });
        }
        // END OF DEATH OF TANKS
        if (tank !== "me" && !newTanks[tank].exploded) {
          if (newTanks[tank].fire) {
            const id = newTanks[tank].fire;
            newTanks[tank].fire = false;
            newState.bulletArray.push({
              type: 0,
              owner: tank,
              id,
              xPos:
                newTanks[tank].xPos +
                tankLogic.type[newTanks[tank].tankType].width / 2 -
                bulletLogic.type[newTanks[tank].ammoType].width / 2,
              yPos:
                newTanks[tank].yPos +
                tankLogic.type[newTanks[tank].tankType].height / 2 -
                bulletLogic.type[newTanks[tank].ammoType].height / 2,
              theta: newTanks[tank].theta,
              width: bulletLogic.type[newTanks[tank].ammoType].width,
              height: bulletLogic.type[newTanks[tank].ammoType].height,
            });
          }

          // tank has self reported a hit
          if (newTanks[tank].hitBy) {
            const { owner, id, point } = newTanks[tank].hitBy;
            if (owner === me.id)
              newState.shotsHit ? newState.shotsHit++ : (newState.shotsHit = 1);

            if (newTanks[tank].health === 0) {
              let killer = newTanks[tank].hitBy.owner;
              if (killer === me.id) {
                killer = "me";
              }
              newTickerItem(
                `${newTanks[killer].username} killed ${newTanks[tank].username}`,
                newState.gameTicker
              );
            }

            // compare reported hit to assumed hit list
            const hitIndex = newState.assumedHits.findIndex(
              (bullet) => bullet.owner === owner && bullet.id === id
            );
            if (hitIndex >= 0) {
              // console.log("hit already detected");
              newState.assumedHits.splice(hitIndex, 1);
            } else {
              // console.log("hit was un-detected");
              const index = newState.bulletArray.findIndex(
                (bullet) => bullet.owner === owner && bullet.id === id
              );

              newState.explosionArray.push({
                type: 0,
                xPos: point[0],
                yPos: point[1],
                step: 0,
                duration: explosionLogic.type["0"].duration,
              });
              newState.bulletArray[index] = {
                ...newState.bulletArray[index],
                ...bulletLogic.moveOB(newState.bulletArray[index]),
              };
            }

            newTanks[tank].hitBy = false;
          }
        }
      }
      // END OF BULLET POSITION/COLLISION/FIRING

      // handle explosion animation / destruction
      newState.explosionArray = explosionLogic.arrayReducer(
        newState.explosionArray
      );
      // END OF EXPLOSION ANIMATION/DESTRUCTION

      //broadcast new tank state
      if (updateMe) {
        emitTankData(
          tankLogic.sharedData({
            ...newTanks.me,
            fire: didFire ? newState.shotsFired : didFire,
            hitBy,
          })
        );
      }

      // clear joind game flag
      if (newTanks.me.joined) {
        delete newTanks.me.joined;
        updateMe = true;
      }

      // decrement all timeouts
      if (newState.reSpawnTimeOut) {
        newState.reSpawnTimeOut--;
      }
      if (newState.fireTimeOut) {
        newState.fireTimeOut--;
      }
      newState.gameTicker = tickerReducer(newState.gameTicker);

      // Update Tank and Game State
      if (updateMe) setTankState({ ...newTanks });
      else if (updateTanks) setTankState({ ...newTanks, me: tankState.me });
      if (updateGame) setGameState({ ...newState });
      else
        setGameState({
          ...gameState,
          assumedHits: newState.assumedHits,
          shotsFired: newState.shotsFired,
          shotsHit: newState.shotsHit,
          enemyKills: newState.enemyKills,
          killStreak: newState.killStreak,
          longestKillStreak: newState.longestKillStreak,
          deaths: newState.deaths,
          deathStreak: newState.deathStreak,
          longestDeathStreak: newState.longestDeathStreak,
          fireTimeOut: newState.fireTimeOut,
          reSpawnTimeOut: newState.reSpawnTimeOut,
          bulletArray: newState.bulletArray,
          explosionArray: newState.explosionArray,
          inactiveTanks: newState.inactiveTanks,
          gameTicker: newState.gameTicker,
        });

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
    emitTankData,
    tankUpdates,
    setTankUpdates,
  ]);

  return null;
};

export default GameLogic;
