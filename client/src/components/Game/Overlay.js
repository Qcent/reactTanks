import transitions from "@material-ui/core/styles/transitions";
import React from "react";

const Overlay = ({ styling, tankState, gameState, mapOverlay, mapObjects }) => {
  const { mapXpos, mapYpos, gameTicker, viewPortWidth } = gameState;
  const {
    showStats,
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
      {gTicker.length && (
        <div
          style={{
            ...styling,
            left: 10,
            bottom: 10,
            width: 210,
            top: "none",
            color: "#a5abb9",
            backgroundColor: "rgba(66, 66, 66, .8)",
            borderRadius: "5px",
            padding: "5px 8px 4px",
          }}
        >
          {gTicker}
        </div>
      )}

      <div
        style={{
          ...styling,
          left: viewPortWidth - 175,
          right: 10,
          bottom: 10,
          top: "none",
          color: "cyan",
          backgroundColor: "rgba(66, 66, 66, .8)",
          borderRadius: "5px",
          padding: "5px 8px",
          opacity: showStats ? 1 : 0,
          transition: "all .75s",
        }}
      >
        <div>shotsFired: {shotsFired || "--"}</div>
        <div>shotsHit: {shotsHit || "--"}</div>
        <div>enemyKills: {enemyKills || "--"}</div>
        <div>killStreak: {killStreak || "--"}</div>
        <div>longestKillStreak: {longestKillStreak || "--"}</div>
        <div>deaths: {deaths || "--"}</div>
        <div>longestDeathStreak: {longestDeathStreak || "--"}</div>
      </div>
    </>
  );
};

export default Overlay;
