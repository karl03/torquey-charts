import type { CarExportData } from "../utils/carDataIO";

// Import all car JSON files
import mazdaMx5Nd from "./cars/mazda-mx5-nd.json";
import fordMustangGt from "./cars/ford-mustang-gt-s550.json";
import hondaCivicTypeR from "./cars/honda-civic-type-r-fk8.json";
import bmwM3E46 from "./cars/bmw-m3-e46.json";
import toyotaSupraA90 from "./cars/toyota-supra-a90.json";
import porsche911_992 from "./cars/porsche-911-992.json";
import subaruWrxSti from "./cars/subaru-wrx-sti.json";
import nissan370z from "./cars/nissan-370z.json";

export interface PresetCar {
  id: string;
  category: string;
  data: CarExportData;
}

export const presetCars: PresetCar[] = [
  { id: "mazda-mx5-nd", category: "JDM", data: mazdaMx5Nd },
  { id: "honda-civic-type-r-fk8", category: "JDM", data: hondaCivicTypeR },
  { id: "toyota-supra-a90", category: "JDM", data: toyotaSupraA90 },
  { id: "nissan-370z", category: "JDM", data: nissan370z },
  { id: "subaru-wrx-sti", category: "JDM", data: subaruWrxSti },
  { id: "bmw-m3-e46", category: "European", data: bmwM3E46 },
  { id: "porsche-911-992", category: "European", data: porsche911_992 },
  { id: "ford-mustang-gt-s550", category: "American", data: fordMustangGt },
];

export const presetCategories = [...new Set(presetCars.map((c) => c.category))];
