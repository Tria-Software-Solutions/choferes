import { useState, useCallback } from "react";

export type ClockFormat = "12h" | "24h";

const KEY = "clockFormat";

const read = (): ClockFormat => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "12h" || v === "24h") return v;
  } catch {}
  return "12h";
};

export const useTimeFormat = () => {
  const [clockFormat, setClockFormatState] = useState<ClockFormat>(read);

  const setClockFormat = useCallback((v: ClockFormat) => {
    try { localStorage.setItem(KEY, v); } catch {}
    setClockFormatState(v);
  }, []);

  return { clockFormat, setClockFormat, is24h: clockFormat === "24h" };
};
