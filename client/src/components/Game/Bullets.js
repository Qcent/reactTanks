import React from "react";

const Bullets = ({ styling, gameState }) => {
  const { bulletArray, mapXpos, mapYpos, viewPortWidth, viewPortHeight } =
    gameState;
  styling = {
    ...styling,
    backgroundColor: "#FF6822",
  };

  return bulletArray.reduce((filtered, bullet, index) => {
    if (
      bullet.xPos - mapXpos <= viewPortWidth &&
      bullet.yPos - mapYpos <= viewPortHeight
    ) {
      filtered.push(
        <div
          key={`tankRound${index}`}
          style={{
            ...styling,
            width: bullet.width,
            height: bullet.height,
            left: bullet.xPos - mapXpos,
            top: bullet.yPos - mapYpos,
            transform: `rotate(${bullet.theta}deg)`,
          }}
        ></div>
      );
    }
    return filtered;
  }, []);
};

export default Bullets;
