import { useState } from "react";
import type { TorqueDataPoint } from "../types";

interface DataInputRowProps {
  index: number;
  data: TorqueDataPoint;
  onChange: (
    index: number,
    field: keyof TorqueDataPoint,
    value: number,
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function DataInputRow({
  index,
  data,
  onChange,
  onRemove,
  canRemove,
}: DataInputRowProps) {
  const [rpmText, setRpmText] = useState(data.rpm.toString());
  const [torqueText, setTorqueText] = useState(data.torque.toString());

  const handleRpmChange = (value: string) => {
    setRpmText(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onChange(index, "rpm", num);
    }
  };

  const handleTorqueChange = (value: string) => {
    setTorqueText(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onChange(index, "torque", num);
    }
  };

  return (
    <div className="data-row">
      <input
        type="number"
        placeholder="RPM"
        value={rpmText}
        onChange={(e) => handleRpmChange(e.target.value)}
        onBlur={() => setRpmText(data.rpm.toString())}
        min="0"
        step="100"
      />
      <input
        type="number"
        placeholder="Torque"
        value={torqueText}
        onChange={(e) => handleTorqueChange(e.target.value)}
        onBlur={() => setTorqueText(data.torque.toString())}
        min="0"
        step="1"
      />
      <button
        className="btn-remove"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        title="Remove row"
      >
        −
      </button>
    </div>
  );
}
