import React from "react";

const Tank = ({ styling }) => {
  styling = { ...styling, backgroundColor: "red", width: 32, height: 48 };
  return <div style={styling}></div>;
};

export default Tank;
