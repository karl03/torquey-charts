import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import type { DataSet, TorqueUnit, PowerUnit } from "../types";
import {
  toNm,
  calculatePowerKw,
  convertPower,
  torqueUnitLabels,
  powerUnitLabels,
} from "../utils/conversions";

interface TorquePowerChartProps {
  dataSets: DataSet[];
  torqueUnit: TorqueUnit;
  powerUnit: PowerUnit;
}

export function TorquePowerChart({
  dataSets,
  torqueUnit,
  powerUnit,
}: TorquePowerChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Highcharts.Chart | null>(null);
  const [showTorque, setShowTorque] = useState(true);
  const [showPower, setShowPower] = useState(true);

  useEffect(() => {
    if (!chartRef.current) return;

    const series: Highcharts.SeriesOptionsType[] = [];

    dataSets
      .filter((ds) => ds.visible)
      .forEach((dataSet) => {
        const validData = dataSet.data
          .filter((d) => d.rpm >= 0 && d.torque >= 0)
          .sort((a, b) => a.rpm - b.rpm);

        const torqueData = validData.map((d) => [d.rpm, d.torque]);
        const powerData = validData.map((d) => {
          const torqueNm = toNm(d.torque, torqueUnit);
          const powerKw = calculatePowerKw(torqueNm, d.rpm);
          return [
            d.rpm,
            Math.round(convertPower(powerKw, powerUnit) * 100) / 100,
          ];
        });

        if (showTorque) {
          series.push({
            name: `${dataSet.name} Torque`,
            type: dataSet.smoothCurve ? "spline" : "line",
            data: torqueData,
            color: dataSet.color,
            yAxis: 0,
            tooltip: {
              valueSuffix: ` ${torqueUnitLabels[torqueUnit]}`,
            },
          });
        }

        if (showPower) {
          series.push({
            name: `${dataSet.name} Power`,
            type: dataSet.smoothCurve ? "spline" : "line",
            data: powerData,
            color: dataSet.color,
            yAxis: 1,
            dashStyle: "Dash",
            tooltip: {
              valueSuffix: ` ${powerUnitLabels[powerUnit]}`,
            },
          });
        }
      });

    const options: Highcharts.Options = {
      chart: {
        type: "spline",
        backgroundColor: "#1a1a2e",
        zooming: { type: "xy" },
      },
      title: {
        text: "Torque & Power vs RPM",
        style: { color: "#eee" },
      },
      xAxis: {
        title: { text: "RPM", style: { color: "#aaa" } },
        labels: { style: { color: "#aaa" } },
        gridLineColor: "#333",
      },
      yAxis: [
        {
          title: {
            text: `Torque (${torqueUnitLabels[torqueUnit]})`,
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
        valueSuffix: "",
      },
      series,
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
  }, [dataSets, torqueUnit, powerUnit, showTorque, showPower]);

  return (
    <div className="chart-wrapper">
      <div className="chart-toggles">
        <label className="chart-toggle">
          <input
            type="checkbox"
            checked={showTorque}
            onChange={(e) => setShowTorque(e.target.checked)}
          />
          <span style={{ color: "#ff6b6b" }}>Torque</span>
        </label>
        <label className="chart-toggle">
          <input
            type="checkbox"
            checked={showPower}
            onChange={(e) => setShowPower(e.target.checked)}
          />
          <span style={{ color: "#4ecdc4" }}>Power</span>
        </label>
      </div>
      <div ref={chartRef} className="chart-container" />
    </div>
  );
}
