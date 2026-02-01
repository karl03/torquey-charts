import { useRef } from "react";
import type { DataSet } from "../types";
import {
  downloadCarJSON,
  readFileAsText,
  parseCarJSON,
} from "../utils/carDataIO";

interface ImportExportButtonsProps {
  dataSet: DataSet;
  onImport: (updates: Partial<DataSet>) => void;
}

export function ImportExportButtons({
  dataSet,
  onImport,
}: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadCarJSON(dataSet);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await readFileAsText(file);
      const result = parseCarJSON(text);

      if (result.success && result.data) {
        onImport(result.data);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch {
      alert("Failed to read file");
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="import-export-buttons">
      <button
        type="button"
        className="btn-io"
        onClick={handleImportClick}
        title="Import car data from JSON"
      >
        📥 Import
      </button>
      <button
        type="button"
        className="btn-io"
        onClick={handleExport}
        title="Export car data to JSON"
      >
        📤 Export
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
