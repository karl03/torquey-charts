import { describe, it, expect } from "vitest";
import { exportCarToJSON, parseCarJSON } from "./carDataIO";
import type { DataSet } from "../types";

const createMockDataSet = (overrides: Partial<DataSet> = {}): DataSet => ({
  name: "Test Car",
  visible: true,
  color: "#ff0000",
  data: [
    { rpm: 1000, torque: 100 },
    { rpm: 2000, torque: 150 },
    { rpm: 3000, torque: 180 },
  ],
  gearConfig: {
    finalDriveRatio: null,
    gearRatios: [],
    tireCircumference: null,
  },
  smoothCurve: true,
  ...overrides,
});

describe("exportCarToJSON", () => {
  it("exports basic car data", () => {
    const dataSet = createMockDataSet();
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.name).toBe("Test Car");
    expect(parsed.data).toHaveLength(3);
    expect(parsed.data[0]).toEqual({ rpm: 1000, torque: 100 });
  });

  it("filters out empty data rows", () => {
    const dataSet = createMockDataSet({
      data: [
        { rpm: 0, torque: 0 },
        { rpm: 1000, torque: 100 },
        { rpm: 0, torque: 0 },
      ],
    });
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0]).toEqual({ rpm: 1000, torque: 100 });
  });

  it("includes wheel diameter when tire circumference is set", () => {
    const dataSet = createMockDataSet({
      gearConfig: {
        finalDriveRatio: null,
        gearRatios: [],
        tireCircumference: 2.0,
      },
    });
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.wheelDiameter).toBeCloseTo(2.0 / Math.PI, 5);
  });

  it("includes final drive ratio when set", () => {
    const dataSet = createMockDataSet({
      gearConfig: {
        finalDriveRatio: 3.73,
        gearRatios: [],
        tireCircumference: null,
      },
    });
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.finalDriveRatio).toBe(3.73);
  });

  it("includes gear ratios when set", () => {
    const dataSet = createMockDataSet({
      gearConfig: {
        finalDriveRatio: null,
        gearRatios: [3.5, 2.1, 1.4, 1.0, 0.8],
        tireCircumference: null,
      },
    });
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.gears).toEqual([3.5, 2.1, 1.4, 1.0, 0.8]);
  });

  it("filters out zero gear ratios", () => {
    const dataSet = createMockDataSet({
      gearConfig: {
        finalDriveRatio: null,
        gearRatios: [3.5, 0, 1.4, 0],
        tireCircumference: null,
      },
    });
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.gears).toEqual([3.5, 1.4]);
  });

  it("does not include optional fields when not set", () => {
    const dataSet = createMockDataSet();
    const json = exportCarToJSON(dataSet);
    const parsed = JSON.parse(json);

    expect(parsed.wheelDiameter).toBeUndefined();
    expect(parsed.finalDriveRatio).toBeUndefined();
    expect(parsed.gears).toBeUndefined();
  });
});

describe("parseCarJSON", () => {
  it("parses valid direct format JSON", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [
        { rpm: 1000, torque: 100 },
        { rpm: 2000, torque: 150 },
      ],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test Car");
    expect(result.data?.data).toHaveLength(2);
  });

  it("parses valid wrapped format JSON", () => {
    const json = JSON.stringify({
      car: {
        name: "Test Car",
        data: [{ rpm: 1000, torque: 100 }],
      },
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test Car");
  });

  it("parses wheel diameter into tire circumference", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [{ rpm: 1000, torque: 100 }],
      wheelDiameter: 0.6,
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(true);
    expect(result.data?.gearConfig?.tireCircumference).toBeCloseTo(
      0.6 * Math.PI,
      5,
    );
  });

  it("parses final drive ratio", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [{ rpm: 1000, torque: 100 }],
      finalDriveRatio: 3.73,
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(true);
    expect(result.data?.gearConfig?.finalDriveRatio).toBe(3.73);
  });

  it("parses gear ratios", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [{ rpm: 1000, torque: 100 }],
      gears: [3.5, 2.1, 1.4],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(true);
    expect(result.data?.gearConfig?.gearRatios).toEqual([3.5, 2.1, 1.4]);
  });

  it("filters invalid gear ratios", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [{ rpm: 1000, torque: 100 }],
      gears: [3.5, -1, "invalid", 0, 2.1],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(true);
    expect(result.data?.gearConfig?.gearRatios).toEqual([3.5, 2.1]);
  });

  it("fails on invalid JSON", () => {
    const result = parseCarJSON("not valid json");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to parse JSON file");
  });

  it("fails when missing name", () => {
    const json = JSON.stringify({
      data: [{ rpm: 1000, torque: 100 }],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid file format");
  });

  it("fails when name is not a string", () => {
    const json = JSON.stringify({
      name: 123,
      data: [{ rpm: 1000, torque: 100 }],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing or invalid car name");
  });

  it("fails when data is not an array", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: "not an array",
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Missing or invalid torque data");
  });

  it("fails when data point has invalid format", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [{ rpm: "invalid", torque: 100 }],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid data point format");
  });

  it("fails when no valid data points", () => {
    const json = JSON.stringify({
      name: "Test Car",
      data: [],
    });

    const result = parseCarJSON(json);

    expect(result.success).toBe(false);
    expect(result.error).toBe("No valid data points found");
  });
});
