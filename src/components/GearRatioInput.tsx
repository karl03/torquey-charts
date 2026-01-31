import type { GearConfig } from "../types";

interface GearRatioInputProps {
  config: GearConfig;
  onChange: (config: GearConfig) => void;
}

export function GearRatioInput({ config, onChange }: GearRatioInputProps) {
  const handleFinalDriveChange = (value: string) => {
    const num = parseFloat(value);
    onChange({ ...config, finalDriveRatio: isNaN(num) ? null : num });
  };

  const handleGearChange = (index: number, value: string) => {
    const num = parseFloat(value);
    const newRatios = [...config.gearRatios];
    newRatios[index] = isNaN(num) ? 0 : num;
    onChange({ ...config, gearRatios: newRatios });
  };

  const handleAddGear = () => {
    onChange({ ...config, gearRatios: [...config.gearRatios, 0] });
  };

  const handleRemoveGear = (index: number) => {
    onChange({
      ...config,
      gearRatios: config.gearRatios.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="input-section">
      <h3>Drivetrain Configuration (Optional)</h3>

      <div className="gear-input-group">
        <label>
          Final Drive Ratio:
          <input
            type="number"
            placeholder="e.g., 3.73"
            value={config.finalDriveRatio ?? ""}
            onChange={(e) => handleFinalDriveChange(e.target.value)}
            step="0.01"
            min="0"
          />
        </label>
      </div>

      <div className="gear-ratios-section">
        <h4>Gear Ratios</h4>
        <div className="gear-list">
          {config.gearRatios.map((ratio, index) => (
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
        <button className="btn-add" onClick={handleAddGear}>
          + Add Gear
        </button>
      </div>

      <p className="hint">
        Enter final drive ratio to see speed-based charts. For single-gear
        vehicles (e.g., EVs), leave gear ratios empty.
      </p>
    </div>
  );
}
