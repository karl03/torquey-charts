import type { UnitStandard, UnitPreset } from "../types";

export const unitPresets: Record<
  Exclude<UnitStandard, "custom">,
  UnitPreset
> = {
  imperial: { torque: "lbft", power: "hp", speed: "mph" },
  metric: { torque: "nm", power: "kw", speed: "kmh" },
  "metric-ps": { torque: "nm", power: "ps", speed: "kmh" },
  si: { torque: "nm", power: "kw", speed: "ms" },
};

export const standardLabels: Record<UnitStandard, string> = {
  imperial: "Imperial (lb·ft, hp, mph)",
  metric: "Metric (N·m, kW, km/h)",
  "metric-ps": "Metric PS (N·m, PS, km/h)",
  si: "SI (N·m, kW, m/s)",
  custom: "Custom",
};
