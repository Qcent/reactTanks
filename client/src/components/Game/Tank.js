import React from "react";
import { tankLogic } from "./logicMethods";

const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

const Tank = ({
  styling,
  tankState,
  mapXpos,
  mapYpos,
  viewPortWidth,
  viewPortHeight,
}) => {
  const { me } = tankState;
  styling = {
    ...styling,
    backgroundColor: "red",
    width: me.width,
    height: me.height,
    left: me.screenX,
    top: me.screenY,
    transform: `rotate(${me.theta}deg)`,
  };
  const otherTanks = [];
  for (const tank in tankState) {
    if (
      tank !== "me" &&
      !tankLogic.isOnScreen(tank, {
        mapXpos,
        mapYpos,
        viewPortWidth,
        viewPortHeight,
      })
    ) {
      otherTanks.push(
        <div
          key={tank}
          style={{
            ...styling,
            backgroundColor: `skyblue`,
            left: tankState[tank].xPos - mapXpos,
            top: tankState[tank].yPos - mapYpos,
            transform: `rotate(${tankState[tank].theta}deg)`,
          }}
        ></div>
      );
    }
  }
  return (
    <>
      <div style={styling}></div>
      {otherTanks}
    </>
  );
};

export default Tank;
