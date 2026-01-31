import { useState } from "react";
import type {
  DataSet,
  TorqueUnit,
  PowerUnit,
  SpeedUnit,
  UnitStandard,
} from "./types";
import { TorqueDataInput } from "./components/TorqueDataInput";
import { UnitSelector } from "./components/UnitSelector";
import { TorquePowerChart } from "./components/TorquePowerChart";
import { SpeedChart } from "./components/SpeedChart";
import "./App.css";

const DATASET_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#feca57",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
];

const createNewCar = (index: number): DataSet => ({
  name: `Car ${index + 1}`,
  visible: true,
  color: DATASET_COLORS[index % DATASET_COLORS.length],
  data: [{ rpm: 0, torque: 0 }],
  gearConfig: {
    finalDriveRatio: null,
    gearRatios: [],
    tireCircumference: null,
  },
});

const initialDataSets: DataSet[] = [
  {
    name: "Car 1",
    visible: true,
    color: DATASET_COLORS[0],
    data: [
      { rpm: 1000, torque: 150 },
      { rpm: 2000, torque: 200 },
      { rpm: 3000, torque: 250 },
      { rpm: 4000, torque: 280 },
      { rpm: 5000, torque: 270 },
      { rpm: 6000, torque: 240 },
    ],
    gearConfig: {
      finalDriveRatio: null,
      gearRatios: [],
      tireCircumference: null,
    },
  },
];

function App() {
  const [dataSets, setDataSets] = useState<DataSet[]>(initialDataSets);
  const [unitStandard, setUnitStandard] = useState<UnitStandard>("imperial");
  const [torqueUnit, setTorqueUnit] = useState<TorqueUnit>("lbft");
  const [powerUnit, setPowerUnit] = useState<PowerUnit>("hp");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("mph");

  const showSpeedChart = dataSets.some(
    (ds) =>
      ds.visible &&
      ds.gearConfig.finalDriveRatio !== null &&
      ds.gearConfig.tireCircumference !== null,
  );

  const updateDataSet = (index: number, updates: Partial<DataSet>) => {
    setDataSets((prev) =>
      prev.map((ds, i) => (i === index ? { ...ds, ...updates } : ds)),
    );
  };

  const addCar = () => {
    setDataSets((prev) => [...prev, createNewCar(prev.length)]);
  };

  const deleteCar = (index: number) => {
    setDataSets((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <h1>🏎️ Torquey Charts</h1>

      <div className="layout">
        <div className="sidebar">
          {dataSets.map((dataSet, index) => (
            <TorqueDataInput
              key={index}
              name={dataSet.name}
              data={dataSet.data}
              torqueUnit={torqueUnit}
              visible={dataSet.visible}
              color={dataSet.color}
              gearConfig={dataSet.gearConfig}
              canDelete={dataSets.length > 1}
              onDataChange={(data) => updateDataSet(index, { data })}
              onNameChange={(name) => updateDataSet(index, { name })}
              onVisibleChange={(visible) => updateDataSet(index, { visible })}
              onGearConfigChange={(gearConfig) =>
                updateDataSet(index, { gearConfig })
              }
              onDelete={() => deleteCar(index)}
            />
          ))}

          <button className="btn-add-car" onClick={addCar}>
            + Add Car
          </button>
        </div>

        <div className="charts">
          <UnitSelector
            unitStandard={unitStandard}
            torqueUnit={torqueUnit}
            powerUnit={powerUnit}
            speedUnit={speedUnit}
            onStandardChange={setUnitStandard}
            onTorqueUnitChange={setTorqueUnit}
            onPowerUnitChange={setPowerUnit}
            onSpeedUnitChange={setSpeedUnit}
          />

          <TorquePowerChart
            dataSets={dataSets}
            torqueUnit={torqueUnit}
            powerUnit={powerUnit}
          />

          {showSpeedChart && (
            <SpeedChart
              dataSets={dataSets}
              torqueUnit={torqueUnit}
              powerUnit={powerUnit}
              speedUnit={speedUnit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
