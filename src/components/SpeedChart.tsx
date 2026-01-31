import { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import type { DataSet, TorqueUnit, PowerUnit, SpeedUnit } from "../types";
import {
  toNm,
  calculatePowerKw,
  convertPower,
  calculateSpeedMs,
  convertSpeed,
  calculateWheelTorque,
  powerUnitLabels,
  speedUnitLabels,
} from "../utils/conversions";

interface SpeedChartProps {
  dataSets: DataSet[];
  torqueUnit: TorqueUnit;
  powerUnit: PowerUnit;
  speedUnit: SpeedUnit;
}

const GEAR_COLORS = [
  "#ff6b6b",
  "#feca57",
  "#48dbfb",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
  "#00d2d3",
  "#1dd1a1",
];

export function SpeedChart({
  dataSets,
  torqueUnit,
  powerUnit,
  speedUnit,
}: SpeedChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const allSeries: Highcharts.SeriesOptionsType[] = [];

    const eligibleDataSets = dataSets.filter(
      (ds) =>
        ds.visible &&
        ds.gearConfig.finalDriveRatio !== null &&
        ds.gearConfig.tireCircumference !== null,
    );

    eligibleDataSets.forEach((dataSet) => {
      const validData = dataSet.data
        .filter((d) => d.rpm >= 0 && d.torque > 0)
        .sort((a, b) => a.rpm - b.rpm);

      // If no gear ratios, use 1:1 (for EVs or single gear)
      const gears =
        dataSet.gearConfig.gearRatios.length > 0
          ? dataSet.gearConfig.gearRatios.filter((r) => r > 0)
          : [1];

      gears.forEach((gearRatio, gearIndex) => {
        const gearLabel =
          dataSet.gearConfig.gearRatios.length > 0 ? `G${gearIndex + 1}` : "";

        const torqueData: [number, number][] = [];
        const powerData: [number, number][] = [];

        validData.forEach((d) => {
          const torqueNm = toNm(d.torque, torqueUnit);
          const speedMs = calculateSpeedMs(
            d.rpm,
            gearRatio,
            dataSet.gearConfig.finalDriveRatio!,
            dataSet.gearConfig.tireCircumference!,
          );
          const speed = convertSpeed(speedMs, speedUnit);

          const wheelTorqueNm = calculateWheelTorque(
            torqueNm,
            gearRatio,
            dataSet.gearConfig.finalDriveRatio!,
          );
          const powerKw = calculatePowerKw(torqueNm, d.rpm);
          const power =
            Math.round(convertPower(powerKw, powerUnit) * 100) / 100;

          torqueData.push([speed, wheelTorqueNm]);
          powerData.push([speed, power]);
        });

        const seriesName = gearLabel
          ? `${dataSet.name} ${gearLabel}`
          : dataSet.name;
        const useDatasetColor = eligibleDataSets.length > 1;
        const gearColor = useDatasetColor
          ? dataSet.color
          : GEAR_COLORS[gearIndex % GEAR_COLORS.length];

        allSeries.push({
          name: `${seriesName} Torque`,
          type: "spline",
          data: torqueData,
          color: gearColor,
          yAxis: 0,
          dashStyle: "Solid",
          tooltip: {
            valueSuffix: " N·m",
          },
        });

        allSeries.push({
          name: `${seriesName} Power`,
          type: "spline",
          data: powerData,
          color: gearColor,
          yAxis: 1,
          dashStyle: "Dash",
          tooltip: {
            valueSuffix: ` ${powerUnitLabels[powerUnit]}`,
          },
        });
      });
    });

    const options: Highcharts.Options = {
      chart: {
        type: "spline",
        backgroundColor: "#1a1a2e",
      },
      title: {
        text: "Wheel Torque & Power vs Speed",
        style: { color: "#eee" },
      },
      xAxis: {
        title: {
          text: `Speed (${speedUnitLabels[speedUnit]})`,
          style: { color: "#aaa" },
        },
        labels: { style: { color: "#aaa" } },
        gridLineColor: "#333",
      },
      yAxis: [
        {
          title: {
            text: "Wheel Torque (N·m)",
            style: { color: "#ff6b6b" },
          },
          labels: { style: { color: "#ff6b6b" } },
          gridLineColor: "#333",
        },
        {
          title: {
            text: `Power (${powerUnitLabels[powerUnit]})`,
            style: { color: "#4ecdc4" },
          },
          labels: { style: { color: "#4ecdc4" } },
          opposite: true,
          gridLineColor: "#333",
        },
      ],
      legend: {
        itemStyle: { color: "#aaa" },
      },
      tooltip: {
        shared: true,
      },
      series: allSeries,
      credits: { enabled: false },
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = Highcharts.chart(chartRef.current, options);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [dataSets, torqueUnit, powerUnit, speedUnit]);

  return <div ref={chartRef} className="chart-container" />;
}
