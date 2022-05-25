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
    const colorStep = 255 / (explosion.duration + 2);
    if (
      pixelBuffer - explosion.xPos - mapXpos <= viewPortWidth + pixelBuffer &&
      pixelBuffer - explosion.yPos - mapYpos <= viewPortHeight + pixelBuffer
    )
      filtered.push(
        explosion.particles.map((point, pIndex) => {
          const dist =
            Math.abs(point[0] - explosion.xPos) +
            Math.abs(point[1] - explosion.yPos);
          const color = `#${(
            "0" + parseInt((explosion.step + dist) * colorStep).toString(16)
          ).slice(-2)}${(
            "0" +
            parseInt((explosion.step + colorStep + dist) * colorStep).toString(
              16
            )
          ).slice(-2)}${("0" + parseInt(explosion.step).toString(16)).slice(
            -2
          )}`;
          return (
            <div
              key={`exparticle${index}${pIndex}`}
              style={{
                ...styling,
                width: 3,
                height: 3,
                left: point[0] - mapXpos,
                top: point[1] - mapYpos,
                backgroundColor: color,
              }}
            ></div>
          );
        })
      );
    return filtered;
  }, []);
};

export default Explosions;
