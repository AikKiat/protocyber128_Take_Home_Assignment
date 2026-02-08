import { useState } from "react";
import { getAISummary } from "../api/ai.api";

export function useAISummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const response = await getAISummary();
      setSummary(response.result);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    summary,
    loading,
    open,
    generate,
    close: () => setOpen(false),
  };
}
