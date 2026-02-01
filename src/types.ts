export interface TorqueDataPoint {
  rpm: number;
  torque: number;
}

export interface DataSet {
  name: string;
  data: TorqueDataPoint[];
  visible: boolean;
  color: string;
  gearConfig: GearConfig;
  smoothCurve: boolean;
}

export type TorqueUnit = "lbft" | "nm";
export type PowerUnit = "kw" | "hp" | "ps";
export type SpeedUnit = "mph" | "kmh" | "ms";

export type UnitStandard =
  | "imperial"
  | "metric"
  | "metric-ps"
  | "si"
  | "custom";

export interface UnitPreset {
  torque: TorqueUnit;
  power: PowerUnit;
  speed: SpeedUnit;
}

export interface GearConfig {
  finalDriveRatio: number | null;
  gearRatios: number[];
  tireCircumference: number | null; // in meters
}
