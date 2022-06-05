import mathLogic from "./math";

const explosionLogic = {
  type: { 0: { duration: 35, size: 26 }, 1: { duration: 66, size: 56 } },
  arrayReducer: (explosions) =>
    explosions.reduce((filtered, explosion) => {
      if (explosion.step < explosionLogic.type[explosion.type].duration) {
        filtered.push({
          ...explosion,
          step: explosion.step + 1,
          particles: explosionLogic.getAnimatedParticles(explosion),
        });
      }
      return filtered;
    }, []),
  getAnimatedParticles: (exp) => {
    const { xPos, yPos, step } = exp;
    const { size, duration } = explosionLogic.type[exp.type];
    const spinFactor = 6.9;
    // use a parabola to get size values
    // (x+a)(x+b)=y
    const peak = (duration / 2) * (duration / 2 - duration - 1),
      calcSize =
        (step + 0) * // (x+a)
        (step - duration - 1) * // (x+b)
        (((size / duration) * duration) / peak); // lower max value to size

    if (step > duration) return;
    let pointMap = [];
    pointMap.push(
      ...mathLogic.pixelsBetweenPoints(
        mathLogic.translateVirtex(
          mathLogic.rotateVirtex(-calcSize, 0, step * spinFactor),
          [xPos, yPos]
        ),
        mathLogic.translateVirtex(
          mathLogic.rotateVirtex(calcSize, 0, step * spinFactor),
          [xPos, yPos]
        )
      ),

      ...mathLogic.pixelsBetweenPoints(
        mathLogic.translateVirtex(
          mathLogic.rotateVirtex(0, -calcSize, step * spinFactor),
          [xPos, yPos]
        ),
        mathLogic.translateVirtex(
          mathLogic.rotateVirtex(0, calcSize, step * spinFactor),
          [xPos, yPos]
        )
      )
    );
    return pointMap;
  },
};

export default explosionLogic;
