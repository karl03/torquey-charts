import { useState } from "react";
import type { DataSet, GearConfig } from "../types";
import { presetCars, presetCategories } from "../data/presetCars";
import type { CarExportData } from "../utils/carDataIO";

interface CarLibraryProps {
  onAddCar: (carData: Partial<DataSet>) => void;
}

function convertToDataSet(car: CarExportData): Partial<DataSet> {
  const gearConfig: GearConfig = {
    finalDriveRatio: car.finalDriveRatio ?? null,
    gearRatios: car.gears ?? [],
    tireCircumference:
      car.wheelDiameter !== undefined ? car.wheelDiameter * Math.PI : null,
  };

  return {
    name: car.name,
    data: car.data,
    gearConfig,
  };
}

export function CarLibrary({ onAddCar }: CarLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCars =
    selectedCategory === "all"
      ? presetCars
      : presetCars.filter((c) => c.category === selectedCategory);

  const handleAddCar = (car: CarExportData) => {
    onAddCar(convertToDataSet(car));
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className="btn-library" onClick={() => setIsOpen(true)}>
        🚗 Car Library
      </button>
    );
  }

  return (
    <div className="car-library">
      <div className="library-header">
        <h3>Car Library</h3>
        <button className="btn-close" onClick={() => setIsOpen(false)}>
          ✕
        </button>
      </div>

      <div className="library-filters">
        <button
          className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {presetCategories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="library-cars">
        {filteredCars.map((car) => (
          <div key={car.id} className="library-car-item">
            <div className="car-info">
              <span className="car-name">{car.data.name}</span>
              <span className="car-category">{car.category}</span>
            </div>
            <button
              className="btn-add-preset"
              onClick={() => handleAddCar(car.data)}
            >
              + Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
