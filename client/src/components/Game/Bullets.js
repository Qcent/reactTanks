import React from "react";

const Bullets = ({ styling, gameState }) => {
  const { bulletArray, mapXpos, mapYpos, viewPortWidth, viewPortHeight } =
    gameState;
  styling = {
    ...styling,
    backgroundColor: "#FF6822",
  };

  return bulletArray
    .filter(
      (bullet) =>
        bullet.xPos - mapXpos <= viewPortWidth &&
        bullet.yPos - mapYpos <= viewPortHeight
    )
    .map((bullet, index) => {
      return (
        <div
          key={`tankRound${index}`}
          style={{
            ...styling,
            width: 9,
            height: 9,
            left: bullet.xPos - mapXpos,
            top: bullet.yPos - mapYpos,
            transform: `rotate(${bullet.theta}deg)`,
          }}
        ></div>
      );
    });
};

export default Bullets;
