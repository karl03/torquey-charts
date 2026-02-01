import type { DataSet, TorqueDataPoint, GearConfig } from "../types";

// Export format - only includes user-entered data, not display settings
export interface CarExportData {
  name: string;
  data: TorqueDataPoint[];
  wheelDiameter?: number; // in meters (circumference / PI)
  finalDriveRatio?: number;
  gears?: number[];
}

export function exportCarToJSON(dataSet: DataSet): string {
  const exportData: CarExportData = {
    name: dataSet.name,
    data: dataSet.data.filter((d) => d.rpm > 0 || d.torque > 0), // Filter empty rows
  };

  // Only include optional fields if they're set
  if (dataSet.gearConfig.tireCircumference !== null) {
    exportData.wheelDiameter = dataSet.gearConfig.tireCircumference / Math.PI;
  }

  if (dataSet.gearConfig.finalDriveRatio !== null) {
    exportData.finalDriveRatio = dataSet.gearConfig.finalDriveRatio;
  }

  if (dataSet.gearConfig.gearRatios.length > 0) {
    exportData.gears = dataSet.gearConfig.gearRatios.filter((g) => g > 0);
  }

  return JSON.stringify(exportData, null, 2);
}

export function downloadCarJSON(dataSet: DataSet): void {
  const json = exportCarToJSON(dataSet);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${dataSet.name.replace(/[^a-z0-9]/gi, "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  data?: Partial<DataSet>;
  error?: string;
}

export function parseCarJSON(jsonString: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate basic structure
    if (!parsed.car && !parsed.name) {
      return { success: false, error: "Invalid file format" };
    }

    // Support both wrapped format and direct format
    const car = parsed.car || parsed;

    if (!car.name || typeof car.name !== "string") {
      return { success: false, error: "Missing or invalid car name" };
    }

    if (!Array.isArray(car.data)) {
      return { success: false, error: "Missing or invalid torque data" };
    }

    // Validate data points
    const validData: TorqueDataPoint[] = [];
    for (const point of car.data) {
      if (typeof point.rpm !== "number" || typeof point.torque !== "number") {
        return { success: false, error: "Invalid data point format" };
      }
      validData.push({ rpm: point.rpm, torque: point.torque });
    }

    if (validData.length === 0) {
      return { success: false, error: "No valid data points found" };
    }

    // Build gear config
    const gearConfig: GearConfig = {
      finalDriveRatio: null,
      gearRatios: [],
      tireCircumference: null,
    };

    if (typeof car.wheelDiameter === "number" && car.wheelDiameter > 0) {
      gearConfig.tireCircumference = car.wheelDiameter * Math.PI;
    }

    if (typeof car.finalDriveRatio === "number" && car.finalDriveRatio > 0) {
      gearConfig.finalDriveRatio = car.finalDriveRatio;
    }

    if (Array.isArray(car.gears)) {
      gearConfig.gearRatios = car.gears.filter(
        (g: unknown) => typeof g === "number" && g > 0,
      );
    }

    return {
      success: true,
      data: {
        name: car.name,
        data: validData,
        gearConfig,
      },
    };
  } catch {
    return { success: false, error: "Failed to parse JSON file" };
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
