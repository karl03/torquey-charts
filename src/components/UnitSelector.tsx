import type { TorqueUnit, PowerUnit, SpeedUnit, UnitStandard } from "../types";
import {
  torqueUnitLabels,
  powerUnitLabels,
  speedUnitLabels,
} from "../utils/conversions";
import { unitPresets, standardLabels } from "../utils/unitPresets";

interface UnitSelectorProps {
  unitStandard: UnitStandard;
  torqueUnit: TorqueUnit;
  powerUnit: PowerUnit;
  speedUnit: SpeedUnit;
  onStandardChange: (standard: UnitStandard) => void;
  onTorqueUnitChange: (unit: TorqueUnit) => void;
  onPowerUnitChange: (unit: PowerUnit) => void;
  onSpeedUnitChange: (unit: SpeedUnit) => void;
}

export function UnitSelector({
  unitStandard,
  torqueUnit,
  powerUnit,
  speedUnit,
  onStandardChange,
  onTorqueUnitChange,
  onPowerUnitChange,
  onSpeedUnitChange,
}: UnitSelectorProps) {
  const handleStandardChange = (standard: UnitStandard) => {
    onStandardChange(standard);
    if (standard !== "custom") {
      const preset = unitPresets[standard];
      onTorqueUnitChange(preset.torque);
      onPowerUnitChange(preset.power);
      onSpeedUnitChange(preset.speed);
    }
  };

  return (
    <div className="unit-selector">
      <label>
        Unit Standard:
        <select
          value={unitStandard}
          onChange={(e) => handleStandardChange(e.target.value as UnitStandard)}
        >
          {(Object.keys(standardLabels) as UnitStandard[]).map((std) => (
            <option key={std} value={std}>
              {standardLabels[std]}
            </option>
          ))}
        </select>
      </label>

      {unitStandard === "custom" && (
        <>
          <label>
            Torque:
            <select
              value={torqueUnit}
              onChange={(e) => onTorqueUnitChange(e.target.value as TorqueUnit)}
            >
              {(Object.keys(torqueUnitLabels) as TorqueUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {torqueUnitLabels[unit]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Power:
            <select
              value={powerUnit}
              onChange={(e) => onPowerUnitChange(e.target.value as PowerUnit)}
            >
              {(Object.keys(powerUnitLabels) as PowerUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {powerUnitLabels[unit]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Speed:
            <select
              value={speedUnit}
              onChange={(e) => onSpeedUnitChange(e.target.value as SpeedUnit)}
            >
              {(Object.keys(speedUnitLabels) as SpeedUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {speedUnitLabels[unit]}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </div>
  );
}
