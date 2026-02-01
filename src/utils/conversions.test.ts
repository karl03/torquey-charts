import { describe, it, expect } from "vitest";
import {
  toNm,
  calculatePowerKw,
  convertPower,
  calculateSpeedMs,
  convertSpeed,
  calculateWheelTorque,
} from "./conversions";

describe("toNm", () => {
  it("converts lb·ft to N·m correctly", () => {
    expect(toNm(100, "lbft")).toBeCloseTo(135.582, 2);
    expect(toNm(200, "lbft")).toBeCloseTo(271.164, 2);
  });

  it("returns N·m unchanged", () => {
    expect(toNm(100, "nm")).toBe(100);
    expect(toNm(250, "nm")).toBe(250);
  });
});

describe("calculatePowerKw", () => {
  it("calculates power correctly", () => {
    // At 1000 RPM with 100 N·m: P = 100 × 1000 × 2π / 60000 ≈ 10.47 kW
    expect(calculatePowerKw(100, 1000)).toBeCloseTo(10.472, 2);

    // At 5000 RPM with 200 N·m: P = 200 × 5000 × 2π / 60000 ≈ 104.72 kW
    expect(calculatePowerKw(200, 5000)).toBeCloseTo(104.72, 1);
  });

  it("returns 0 when RPM is 0", () => {
    expect(calculatePowerKw(100, 0)).toBe(0);
  });

  it("returns 0 when torque is 0", () => {
    expect(calculatePowerKw(0, 5000)).toBe(0);
  });
});

describe("convertPower", () => {
  it("returns kW unchanged", () => {
    expect(convertPower(100, "kw")).toBe(100);
  });

  it("converts kW to hp correctly", () => {
    expect(convertPower(100, "hp")).toBeCloseTo(134.102, 2);
  });

  it("converts kW to PS correctly", () => {
    expect(convertPower(100, "ps")).toBeCloseTo(135.962, 2);
  });
});

describe("calculateSpeedMs", () => {
  it("calculates speed correctly", () => {
    // 3000 RPM, gear ratio 2.0, final drive 3.5, tire circumference 2.0m
    // Wheel RPM = 3000 / (2.0 × 3.5) = 428.57
    // Speed = 428.57 × 2.0 / 60 = 14.29 m/s
    expect(calculateSpeedMs(3000, 2.0, 3.5, 2.0)).toBeCloseTo(14.286, 2);
  });

  it("returns 0 when RPM is 0", () => {
    expect(calculateSpeedMs(0, 2.0, 3.5, 2.0)).toBe(0);
  });

  it("higher gear ratio results in lower speed", () => {
    const speed1 = calculateSpeedMs(3000, 1.0, 3.5, 2.0);
    const speed2 = calculateSpeedMs(3000, 2.0, 3.5, 2.0);
    expect(speed1).toBeGreaterThan(speed2);
  });
});

describe("convertSpeed", () => {
  it("returns m/s unchanged", () => {
    expect(convertSpeed(10, "ms")).toBe(10);
  });

  it("converts m/s to km/h correctly", () => {
    expect(convertSpeed(10, "kmh")).toBeCloseTo(36, 1);
  });

  it("converts m/s to mph correctly", () => {
    expect(convertSpeed(10, "mph")).toBeCloseTo(22.369, 2);
  });
});

describe("calculateWheelTorque", () => {
  it("calculates wheel torque correctly", () => {
    // 200 N·m × gear 2.5 × final 3.5 = 1750 N·m
    expect(calculateWheelTorque(200, 2.5, 3.5)).toBe(1750);
  });

  it("returns 0 when engine torque is 0", () => {
    expect(calculateWheelTorque(0, 2.5, 3.5)).toBe(0);
  });

  it("higher gear ratio results in higher wheel torque", () => {
    const torque1 = calculateWheelTorque(200, 1.0, 3.5);
    const torque2 = calculateWheelTorque(200, 2.0, 3.5);
    expect(torque2).toBeGreaterThan(torque1);
  });
});
