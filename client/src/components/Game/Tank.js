import React from "react";

const Tank = ({ styling, tankState }) => {
  const { me } = tankState;
  styling = {
    ...styling,
    backgroundColor: "red",
    width: 48,
    height: 32,
    left: me.xPos,
    top: me.yPos,
    transform: `rotate(${me.theta}deg)`,
  };
  return <div style={styling}></div>;
};

export default Tank;
