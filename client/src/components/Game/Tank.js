import React from "react";

const Tank = ({ styling, tankState }) => {
  const { me } = tankState;
  styling = {
    ...styling,
    backgroundColor: "red",
    width: 32,
    height: 48,
    left: me.xPos,
    top: me.yPos,
  };
  return <div style={styling}></div>;
};

export default Tank;
