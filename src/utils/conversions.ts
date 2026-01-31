import type { TorqueUnit, PowerUnit, SpeedUnit } from "../types";

// Torque conversions to N·m
export const toNm = (value: number, unit: TorqueUnit): number => {
  return unit === "lbft" ? value * 1.35582 : value;
};

// Power calculation: P (kW) = T (N·m) × ω (rad/s) / 1000
// ω = RPM × 2π / 60
export const calculatePowerKw = (torqueNm: number, rpm: number): number => {
  return (torqueNm * rpm * 2 * Math.PI) / (60 * 1000);
};

// Power conversions from kW
export const convertPower = (kw: number, unit: PowerUnit): number => {
  switch (unit) {
    case "kw":
      return kw;
    case "hp":
      return kw * 1.34102; // mechanical horsepower
    case "ps":
      return kw * 1.35962; // metric horsepower
  }
};

// Speed calculation from RPM
export const calculateSpeedMs = (
  rpm: number,
  gearRatio: number,
  finalDriveRatio: number,
  tireCircumference: number,
): number => {
  // Wheel RPM = Engine RPM / (gear ratio × final drive ratio)
  const wheelRpm = rpm / (gearRatio * finalDriveRatio);
  // Speed (m/s) = wheel RPM × tire circumference / 60
  return (wheelRpm * tireCircumference) / 60;
};

export const convertSpeed = (ms: number, unit: SpeedUnit): number => {
  switch (unit) {
    case "ms":
      return ms;
    case "kmh":
      return ms * 3.6;
    case "mph":
      return ms * 2.23694;
  }
};

// Calculate wheel torque
export const calculateWheelTorque = (
  engineTorqueNm: number,
  gearRatio: number,
  finalDriveRatio: number,
): number => {
  return engineTorqueNm * gearRatio * finalDriveRatio;
};

// Unit labels
export const torqueUnitLabels: Record<TorqueUnit, string> = {
  lbft: "lb·ft",
  nm: "N·m",
};

export const powerUnitLabels: Record<PowerUnit, string> = {
  kw: "kW",
  hp: "hp",
  ps: "PS",
};

export const speedUnitLabels: Record<SpeedUnit, string> = {
  mph: "mph",
  kmh: "km/h",
  ms: "m/s",
};
