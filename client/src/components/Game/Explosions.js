import React from "react";

const Explosions = ({ styling, gameState }) => {
  const { explosionArray, mapXpos, mapYpos, viewPortWidth, viewPortHeight } =
    gameState;
  styling = {
    ...styling,
    backgroundColor: "#FF68FF",
  };
  const pixelBuffer = 15;

  return explosionArray.reduce((filtered, explosion, index) => {
    if (
      pixelBuffer - explosion.xPos - mapXpos <= viewPortWidth + pixelBuffer &&
      pixelBuffer - explosion.yPos - mapYpos <= viewPortHeight + pixelBuffer
    )
      filtered.push(
        explosion.particles.map((point, pIndex) => {
          return (
            <div
              key={`exparticle${index}${pIndex}`}
              style={{
                ...styling,
                width: 3,
                height: 3,
                left: point[0] - mapXpos,
                top: point[1] - mapYpos,
              }}
            ></div>
          );
        })
      );
    return filtered;
  }, []);
};

export default Explosions;
