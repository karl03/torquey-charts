import { useState } from "react";
import type { TorqueDataPoint, TorqueUnit, GearConfig } from "../types";
import { DataInputRow } from "./DataInputRow";
import { torqueUnitLabels } from "../utils/conversions";

const TIRE_PRESETS: { label: string; value: number | null }[] = [
  { label: "Select tire size...", value: null },
  { label: "205/55R16 (1.97m)", value: 1.97 },
  { label: "215/45R17 (1.94m)", value: 1.94 },
  { label: "225/45R17 (1.98m)", value: 1.98 },
  { label: "225/40R18 (1.96m)", value: 1.96 },
  { label: "235/40R18 (2.00m)", value: 2.0 },
  { label: "245/40R18 (2.01m)", value: 2.01 },
  { label: "255/35R18 (1.96m)", value: 1.96 },
  { label: "265/35R18 (2.00m)", value: 2.0 },
  { label: "275/35R19 (2.07m)", value: 2.07 },
  { label: "285/30R19 (2.00m)", value: 2.0 },
  { label: "295/30R20 (2.09m)", value: 2.09 },
  { label: "305/30R20 (2.11m)", value: 2.11 },
  { label: "Custom", value: -1 },
];

interface TorqueDataInputProps {
  name: string;
  data: TorqueDataPoint[];
  torqueUnit: TorqueUnit;
  visible: boolean;
  color: string;
  gearConfig: GearConfig;
  canDelete: boolean;
  onDataChange: (data: TorqueDataPoint[]) => void;
  onNameChange: (name: string) => void;
  onVisibleChange: (visible: boolean) => void;
  onGearConfigChange: (config: GearConfig) => void;
  onDelete: () => void;
}

export function TorqueDataInput({
  name,
  data,
  torqueUnit,
  visible,
  color,
  gearConfig,
  canDelete,
  onDataChange,
  onNameChange,
  onVisibleChange,
  onGearConfigChange,
  onDelete,
}: TorqueDataInputProps) {
  // Local state to track dropdown selection (persists "Custom" choice)
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    // Initialize: check if current value matches a preset
    const match = TIRE_PRESETS.find(
      (p) => p.value === gearConfig.tireCircumference,
    );
    return match
      ? (match.value?.toString() ?? "")
      : gearConfig.tireCircumference !== null
        ? "-1"
        : "";
  });

  // Local state for custom diameter input (avoids formatting issues while typing)
  const [customDiameter, setCustomDiameter] = useState<string>(() => {
    return gearConfig.tireCircumference !== null
      ? (gearConfig.tireCircumference / Math.PI).toFixed(3)
      : "";
  });

  const handleChange = (
    index: number,
    field: keyof TorqueDataPoint,
    value: number,
  ) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onDataChange(newData);
  };

  const handleAdd = () => {
    onDataChange([...data, { rpm: 0, torque: 0 }]);
  };

  const handleRemove = (index: number) => {
    if (data.length > 1) {
      onDataChange(data.filter((_, i) => i !== index));
    }
  };

  const handleFinalDriveChange = (value: string) => {
    const num = parseFloat(value);
    onGearConfigChange({
      ...gearConfig,
      finalDriveRatio: isNaN(num) ? null : num,
    });
  };

  const handleTireDiameterChange = (value: string) => {
    setCustomDiameter(value);
    const diameter = parseFloat(value);
    // Convert diameter to circumference: C = π × d
    const circumference = isNaN(diameter) ? null : diameter * Math.PI;
    onGearConfigChange({ ...gearConfig, tireCircumference: circumference });
  };

  const handleTirePresetChange = (value: string) => {
    setSelectedPreset(value);
    const num = parseFloat(value);
    if (num === -1) {
      // Custom selected - keep current value
      return;
    }
    // Preset selected - update tire circumference
    onGearConfigChange({
      ...gearConfig,
      tireCircumference: isNaN(num) ? null : num,
    });
  };

  const isCustomTire = selectedPreset === "-1";

  const handleGearChange = (index: number, value: string) => {
    const num = parseFloat(value);
    const newRatios = [...gearConfig.gearRatios];
    newRatios[index] = isNaN(num) ? 0 : num;
    onGearConfigChange({ ...gearConfig, gearRatios: newRatios });
  };

  const handleAddGear = () => {
    onGearConfigChange({
      ...gearConfig,
      gearRatios: [...gearConfig.gearRatios, 0],
    });
  };

  const handleRemoveGear = (index: number) => {
    onGearConfigChange({
      ...gearConfig,
      gearRatios: gearConfig.gearRatios.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="input-section" style={{ borderColor: color }}>
      <div className="section-header">
        <input
          type="text"
          className="dataset-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Dataset name"
        />
        <div className="header-controls">
          <label className="visibility-toggle">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => onVisibleChange(e.target.checked)}
            />
            <span style={{ color }}>Show</span>
          </label>
          {canDelete && (
            <button
              className="btn-delete-car"
              onClick={onDelete}
              title="Delete car"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <h4>Torque Data</h4>
      <div className="data-header">
        <span>RPM</span>
        <span>Torque ({torqueUnitLabels[torqueUnit]})</span>
        <span></span>
      </div>

      {data.map((point, index) => (
        <DataInputRow
          key={index}
          index={index}
          data={point}
          onChange={handleChange}
          onRemove={handleRemove}
          canRemove={data.length > 1}
        />
      ))}

      <button className="btn-add" onClick={handleAdd}>
        + Add Row
      </button>

      <h4>Drivetrain (Optional)</h4>
      <div className="gear-input-group">
        <label>
          Wheel Diameter (m):
          <select
            value={selectedPreset}
            onChange={(e) => handleTirePresetChange(e.target.value)}
          >
            {TIRE_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.value ?? ""}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        {(isCustomTire || selectedPreset === "-1") && (
          <input
            type="number"
            placeholder="e.g., 0.65"
            value={customDiameter}
            onChange={(e) => handleTireDiameterChange(e.target.value)}
            step="0.001"
            min="0"
          />
        )}
      </div>
      <div className="gear-input-group">
        <label>
          Final Drive Ratio:
          <input
            type="number"
            placeholder="e.g., 3.73"
            value={gearConfig.finalDriveRatio ?? ""}
            onChange={(e) => handleFinalDriveChange(e.target.value)}
            step="0.01"
            min="0"
          />
        </label>
      </div>

      {gearConfig.gearRatios.length > 0 && (
        <div className="gear-list">
          {gearConfig.gearRatios.map((ratio, index) => (
            <div key={index} className="gear-row">
              <span className="gear-label">Gear {index + 1}:</span>
              <input
                type="number"
                placeholder={`e.g., ${(3.5 - index * 0.5).toFixed(2)}`}
                value={ratio || ""}
                onChange={(e) => handleGearChange(index, e.target.value)}
                step="0.01"
                min="0"
              />
              <button
                className="btn-remove"
                onClick={() => handleRemoveGear(index)}
                title="Remove gear"
              >
                −
              </button>
            </div>
          ))}
        </div>
      )}
      <button className="btn-add btn-add-gear" onClick={handleAddGear}>
        + Add Gear
      </button>
    </div>
  );
}
