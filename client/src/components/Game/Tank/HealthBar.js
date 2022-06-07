import React from "react";

const HealthBar = ({ styling, enemy, health, maxHealth, left, top, width }) => {
  const healthPercent = health / maxHealth;
  const barColor = enemy ? "#e91329" : "#29d3e9",
    outlineColor = enemy ? "#cc3e02" : "#029ecc";

  const HealthBarStyling = {
    ...styling,
    display: "flex",
    justifyContent: "center",
    gap: ".5px",
    width: width,
    left: left - width / 4.5,
    top: top - 4,
  };

  const HealthSideBoxStyling = {
    backgroundColor: barColor,
    border: `1px solid ${outlineColor}`,
    borderRadius: "5px",
    width:
      healthPercent > 0.33
        ? (width / 3) * ((100 / 77) * healthPercent - 0.33)
        : 0,
    maxWidth: width / 3,
    height: "5px",
    opacity: healthPercent < 0.33 ? 0 : 1,
  };

  const HealthBoxStyling = {
    backgroundColor: barColor,
    border: `1px solid ${outlineColor}`,
    borderRadius: "5px",
    minWidth: "4px",
    width: healthPercent > 0.33 ? width / 3 : (width / 3) * healthPercent * 3,
    maxWidth: width / 3 - 1,
    height: "5px",
  };

  return (
    <div style={HealthBarStyling}>
      <div style={HealthSideBoxStyling}></div>
      <div style={HealthBoxStyling}></div>
      <div style={HealthSideBoxStyling}></div>
    </div>
  );
};

export default HealthBar;