import { useState } from "react";
import type { FileHistoryItem } from "../types";

export function useFileHistory() {
  const [history, setHistory] = useState<FileHistoryItem[]>([]);

  const addFile = (item: FileHistoryItem) => {
    setHistory((prev) => [
      item,
      ...prev.filter((f) => f.uuid !== item.uuid),
    ]);
  };

  return {
    history,
    addFile,
  };
}
