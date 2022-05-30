import React from "react";

const Tank = ({ styling, tankState, mapXpos, mapYpos }) => {
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
    if (tank !== "me") {
      otherTanks.push(
        <div
          key={tankState[tank].id}
          style={{
            ...styling,
            backgroundColor: "green",
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
