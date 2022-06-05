import React from "react";

const Overlay = ({ styling, tankState, gameState, mapOverlay, mapObjects }) => {
  const { mapXpos, mapYpos, gameTicker } = gameState;
  const {
    shotsFired,
    shotsHit,
    enemyKills,
    killStreak,
    longestKillStreak,
    deaths,
    longestDeathStreak,
  } = gameState;
  const { me } = tankState;
  const { colLine, bulletTest } = me;

  styling = {
    ...styling,
    left: -mapXpos,
    top: -mapYpos,
  };

  const pointStyle = {
    ...styling,
    border: "1px solid #363636",
    borderRadius: "50%",
    backgroundColor: "#363636",
    width: 1,
    height: 1,
  };

  const gTicker = [],
    points = [];

  if (colLine?.length) {
    for (let i = 0; i < colLine.length; i++) {
      const [x, y] = colLine[i];

      points.push(
        <div
          key={i}
          style={{ ...pointStyle, left: x - mapXpos, top: y - mapYpos }}
        ></div>
      );
    }
  }

  if (bulletTest?.length) {
    for (let i = 0; i < bulletTest.length; i++) {
      const [x, y] = bulletTest[i];

      points.push(
        <div
          key={`bullet${i}`}
          style={{ ...pointStyle, left: x - mapXpos, top: y - mapYpos }}
        ></div>
      );
    }
  }

  if (gameTicker?.length) {
    for (let i = 0; i < gameTicker.length; i++) {
      gTicker.push(<div key={`gtick${i}`}>{gameTicker[i].txt}</div>);
    }
  }

  return (
    <>
      <img src={mapOverlay} style={styling} alt="map" />
      {points}
      <div style={{ ...styling, left: 10, bottom: 10, top: "none" }}>
        {gTicker}
      </div>

      <div
        style={{
          ...styling,
          left: "90%",
          bottom: 10,
          top: "none",
          color: "cyan",
        }}
      >
        <div>shotsFired: {shotsFired}</div>
        <div>shotsHit: {shotsHit}</div>
        <div>enemyKills: {enemyKills}</div>
        <div>killStreak: {killStreak}</div>
        <div>longestKillStreak: {longestKillStreak}</div>
        <div>deaths: {deaths}</div>
        <div>longestDeathStreak: {longestDeathStreak}</div>
      </div>
    </>
  );
};

export default Overlay;
