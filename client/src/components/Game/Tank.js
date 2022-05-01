import React from "react";

const Tank = ({ styling, tankState }) => {
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
  return <div style={styling}></div>;
};

export default Tank;
