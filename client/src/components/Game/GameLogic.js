import { useEffect } from "react";

const RADS = Math.PI / 180;

const GameLogic = ({
  inputState,
  gameState,
  setGameState,
  tankState,
  setTankState,
  readyState,
  setReadyState,
}) => {
  // logic helpers

  const screenLogic = {
    moveY: (amt) => {
      return { mapYpos: gameState.mapYpos + amt };
    },
    moveX: (amt) => {
      return { mapXpos: gameState.mapXpos + amt };
    },
    findLength: (x, y) => Math.sqrt(x * x + y * y),
    slopeToAngle: (slope) => Math.atan(slope) / RADS,
    moveAtAngle: (
      { mapXpos, mapYpos, theta },
      pos = 1,
      speed = gameState.tankSpeed
    ) => {
      return screenLogic.coordLimitCheck({
        mapXpos: mapXpos + Math.cos(theta * RADS) * speed * pos,
        mapYpos: mapYpos + Math.sin(theta * RADS) * speed * pos,
      });
    },
    coordLimitCheck: ({ mapXpos, mapYpos }) => {
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
    rotate: (tank, pos = 1) =>
      tankLogic.rotateLimiter(tank.theta + gameState.tankSpeed * 1.5 * pos),
    rotateLimiter: (theta) => (theta > 0 ? theta % 360 : (theta + 360) % 360),
    moveAtAngle: (tank, pos = 1) => {
      return tankLogic.coordLimitCheck(tank, {
        xPos:
          tank.xPos + Math.cos(tank.theta * RADS) * gameState.tankSpeed * pos,
        yPos:
          tank.yPos + Math.sin(tank.theta * RADS) * gameState.tankSpeed * pos,
      });
    },
    coordLimitCheck: (tank, { xPos, yPos }) => {
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
  };

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
        newTanks.me = { ...newTanks.me, ...tankLogic.moveAtAngle(me) };
        updateMe = true;
      }
      if (inputState["ArrowDown"]) {
        newTanks.me = { ...newTanks.me, ...tankLogic.moveAtAngle(me, -1) };
        updateMe = true;
      }
      if (inputState["q"]) {
        newState.cruiseMode = !gameState.cruiseMode;
        updateGame = true;
      }

      // END OF INPUTS

      // handle onscreen position of tank
      if (newState.cruiseMode) {
        // keep screen centered on tank
        const middleX = gameState.viewPortWidth / 2 - me.width / 2;
        const middleY = gameState.viewPortHeight / 2 - me.height / 2;
        const targetXDif = middleX - newTanks.me.screenX;
        const targetYDif = middleY - newTanks.me.screenY;
        const totalDist = screenLogic.findLength(targetXDif, targetYDif);

        if (totalDist < 5 && (updateMe || updateGame)) {
          updateMe = updateGame = true;
          console.log("Centered");
          const { mapXpos, mapYpos, drift } = screenLogic.coordLimitCheck({
            mapXpos: newTanks.me.xPos - middleX,
            mapYpos: newTanks.me.yPos - middleY,
          });
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
          const { mapXpos, mapYpos } = screenLogic.coordLimitCheck(
            screenLogic.moveAtAngle(
              {
                theta: screenLogic.slopeToAngle(targetYDif / targetXDif),
                mapXpos: newState.mapXpos,
                mapYpos: newState.mapYpos,
              },
              targetXDif < 0 ? 1 : -1, //direction of travel
              speed
            )
          );

          const screenX = parseFloat((newTanks.me.xPos - mapXpos).toFixed(1));
          const screenY = parseFloat((newTanks.me.yPos - mapYpos).toFixed(1));

          if (screenX !== me.screenX || screenY !== me.screenY) {
            console.log(totalDist, ":", speed);
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
            ...screenLogic.coordLimitCheck({ mapXpos, mapYpos }),
          };
        }
        //end of battle mode
      }
      // END OF ONSCREEN POSITION

      // Update Tank and Game State
      if (updateMe) setTankState({ ...newTanks });
      if (updateGame) setGameState({ ...newState });

      if (updateMe) console.log(newTanks.me);
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
    tankLogic,
    screenLogic,
  ]);

  return null;
};

export default GameLogic;
