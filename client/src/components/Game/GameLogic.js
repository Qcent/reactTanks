import React, { useEffect } from "react";

const GameLogic = ({
  gameState,
  setGameState,
  tankState,
  setTankState,
  readyState,
  setReadyState,
  tankLogic,
  screenLogic,
}) => {
  // Lifecycle

  useEffect(() => {
    //console.log(inputState);
    if (readyState) {
      // do stuff

      if (gameState.cruiseMode) {
        // keep tank centered
        const middleX = gameState.viewPortWidth / 2 - tankState.me.width / 2;
        const middleY = gameState.viewPortHeight / 2 - tankState.me.height / 2;
        const speed = 10;
        let dif = 0;
        // X Centering
        if (tankState.me.xPos < middleX) {
          dif = middleX - tankState.me.xPos;
          if (gameState.mapXpos - dif > dif / 1 / speed) {
            setGameState((prev) => {
              return {
                ...prev,
                ...screenLogic.moveX(dif > 2 ? -dif / 1 / speed : -dif),
              };
            });
            setTankState((prev) => {
              return {
                ...prev,
                me: {
                  ...prev.me,
                  xPos: tankLogic.moveX(
                    tankState.me,
                    dif > 2 ? dif / 1 / speed : dif
                  ).xPos,
                },
              };
            });
          }
        }
        if (tankState.me.xPos > middleX) {
          dif = tankState.me.xPos - middleX;
          if (
            gameState.mapWidth - (gameState.mapXpos + gameState.viewPortWidth) >
            dif / 1 / speed
          ) {
            setGameState((prev) => {
              return {
                ...prev,
                ...screenLogic.moveX(dif > 2 ? dif / 1 / speed : dif),
              };
            });
            setTankState((prev) => {
              return {
                ...prev,
                me: {
                  ...prev.me,
                  xPos: tankLogic.moveX(
                    tankState.me,
                    dif > 2 ? -dif / 1 / speed : -dif
                  ).xPos,
                },
              };
            });
          }
        }

        // Y Centering
        if (tankState.me.yPos < middleY) {
          dif = middleY - tankState.me.yPos;
          if (gameState.mapYpos - dif > dif / 1 / speed) {
            setGameState((prev) => {
              return {
                ...prev,
                ...screenLogic.moveY(dif > 2 ? -dif / 1 / speed : -dif),
              };
            });
            setTankState((prev) => {
              return {
                ...prev,
                me: {
                  ...prev.me,
                  yPos: tankLogic.moveY(
                    tankState.me,
                    dif > 2 ? dif / 1 / speed : dif
                  ).yPos,
                },
              };
            });
          }
        }
        if (tankState.me.yPos > middleY) {
          dif = tankState.me.yPos - middleY;
          if (
            gameState.mapHeight -
              (gameState.mapYpos + gameState.viewPortHeight) >
            dif / 1 / speed
          ) {
            setGameState((prev) => {
              return {
                ...prev,
                ...screenLogic.moveY(dif > 2 ? dif / 1 / speed : dif),
              };
            });
            setTankState((prev) => {
              return {
                ...prev,
                me: {
                  ...prev.me,
                  yPos: tankLogic.moveY(
                    tankState.me,
                    dif > 2 ? -dif / 1 / speed : -dif
                  ).yPos,
                },
              };
            });
          }
        }
      }

      setReadyState(false);
    }
  }, [gameState, tankState, readyState, setReadyState]);

  return null;
};

export default GameLogic;
