import React from "react";
import { tankLogic } from "../logicMethods";

import HealthBar from "./HealthBar";

const Tank = ({
  styling,
  tankState,
  mapXpos,
  mapYpos,
  viewPortWidth,
  viewPortHeight,
  friendlyTags,
  enemyTags,
  friendlyHealth,
  enemyHealth,
}) => {
  const halfCharWidth = 3;
  const { me } = tankState;

  const otherTankStyling = {
    ...styling,
    backgroundColor: `red`,
  };
  const tankNameTag = {
    ...styling,
    border: "1px solid #e62b2b",
    borderRadius: "8px",
    color: "#e62b2b",
    fontWeight: 800,
    padding: "0 8px",
  };
  const meStyling = {
    ...styling,
    backgroundColor: "#29d3e9",
    width: me.width,
    height: me.height,
    left: me.screenX,
    top: me.screenY,
    transform: `rotate(${me.theta}deg)`,
  };

  const otherTanks = [];
  for (const tank in tankState) {
    if (
      !tankState[tank].exploded &&
      tank !== "me" &&
      !tankLogic.isOnScreen(tankState[tank], {
        mapXpos,
        mapYpos,
        viewPortWidth,
        viewPortHeight,
      })
    ) {
      otherTanks.push(
        <div key={tank}>
          {enemyTags && (
            <div
              key={"nameTag" + tank}
              style={{
                ...tankNameTag,
                left:
                  tankState[tank].xPos -
                  mapXpos -
                  tankState[tank].username.length * halfCharWidth,
                top:
                  tankState[tank].yPos -
                  mapYpos -
                  tankLogic.type[tankState[tank].tankType].height,
              }}
            >
              {tankState[tank].username}
            </div>
          )}
          <div
            key={"oTank" + tank}
            style={{
              ...otherTankStyling,
              width: tankLogic.type[tankState[tank].tankType].width,
              height: tankLogic.type[tankState[tank].tankType].height,
              left: tankState[tank].xPos - mapXpos,
              top: tankState[tank].yPos - mapYpos,
              transform: `rotate(${tankState[tank].theta}deg)`,
            }}
          ></div>
          {enemyHealth && (
            <HealthBar
              key={"health" + tank}
              enemy={true}
              styling={styling}
              health={tankState[tank].health}
              maxHealth={tankLogic.type[tankState[tank].tankType].maxHealth}
              left={tankState[tank].xPos - mapXpos}
              top={tankState[tank].yPos - mapYpos}
              width={tankLogic.type[tankState[tank].tankType].width * 1.75}
            />
          )}
        </div>
      );
    }
  }
  return (
    <>
      {!me.exploded && (
        <>
          <div key={"myTank"} style={meStyling}></div>
          {friendlyTags && (
            <div
              key={"myNameTag"}
              style={{
                ...tankNameTag,
                color: "skyblue",
                borderColor: "skyblue",
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: "#777777",
                left: me.xPos - mapXpos - me.username.length * halfCharWidth,
                top: me.yPos - mapYpos - tankLogic.type[me.tankType].height,
                zIndex: 5,
              }}
            >
              {me.username}
            </div>
          )}
          {friendlyHealth && (
            <HealthBar
              key={"myHealth"}
              styling={styling}
              health={me.health}
              maxHealth={tankLogic.type[me.tankType].maxHealth}
              left={me.xPos - mapXpos}
              top={me.yPos - mapYpos}
              width={me.width * 1.75}
            />
          )}
        </>
      )}
      {otherTanks}
    </>
  );
};

export default Tank;
