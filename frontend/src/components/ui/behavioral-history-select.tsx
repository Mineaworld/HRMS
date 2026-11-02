"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface HistoryOption {
  value: string;
  label: string;
}

export interface BehavioralHistorySelectProps {
  options: HistoryOption[];
  label?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  maxHistory?: number; // recent items to remember
  storageKey?: string; // localStorage key
  selectWidth?: string | number; // fixed width
  className?: string;
}

interface StoredHistory {
  value: string;
  count: number;
  timestamp: number;
}

export const BehavioralHistorySelect: React.FC<BehavioralHistorySelectProps> = ({
  options,
  label,
  placeholder = "Select an option...",
  onChange,
  defaultValue,
  value,
  maxHistory = 5,
  storageKey = "behavioral_history_select",
  selectWidth = "280px",
  className,
}) => {
  const [selected, setSelected] = React.useState(value || defaultValue || "");
  const [history, setHistory] = React.useState<StoredHistory[]>([]);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  // Load history from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch {
          // ignore parsing error
        }
      }
    }
  }, [storageKey]);

  const handleChange = (val: string) => {
    setSelected(val);
    onChange?.(val);

    setHistory((prev) => {
      const existing = prev.find((h) => h.value === val);
      let updated: StoredHistory[];
      if (existing) {
        updated = prev.map((h) =>
          h.value === val
            ? { ...h, count: h.count + 1, timestamp: Date.now() }
            : h
        );
      } else {
        updated = [...prev, { value: val, count: 1, timestamp: Date.now() }];
      }

      // Sort by frequency & recency
      updated.sort((a, b) => {
        if (b.count === a.count) return b.timestamp - a.timestamp;
        return b.count - a.count;
      });

      // Limit recent history
      const limited = updated.slice(0, maxHistory);

      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(limited));
      }

      return limited;
    });
  };

  // Prepare sections
  const recentItems = history
    .map((h) => options.find((o) => o.value === h.value))
    .filter(Boolean) as HistoryOption[];

  const otherItems = options.filter((o) => !recentItems.some((r) => r.value === o.value));

  const widthStyle = typeof selectWidth === "number" ? `${selectWidth}px` : selectWidth;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Select value={selected || undefined} defaultValue={defaultValue} onValueChange={handleChange}>
        <SelectTrigger
          className="w-full bg-white border-slate-200 text-xs text-slate-800 rounded-xl shadow-sm focus:ring-blue-500/20"
          style={{ width: widthStyle, minWidth: widthStyle }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="bg-white/95 backdrop-blur-md border-slate-200 shadow-xl rounded-xl"
          style={{ width: widthStyle }}
        >
          {label && (
            <SelectGroup>
              <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                {label}
              </SelectLabel>
            </SelectGroup>
          )}

          {recentItems.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-blue-600 px-3 py-1">
                Recent
              </SelectLabel>
              {recentItems.map((opt) => {
                const stored = history.find((h) => h.value === opt.value);
                return (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="flex justify-between items-center w-full text-xs text-slate-700 py-2 cursor-pointer hover:bg-slate-50 focus:bg-blue-50 focus:text-blue-700"
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-auto">
                      {stored?.count}×
                    </span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          )}

          {otherItems.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                {recentItems.length > 0 ? "Other Options" : "Options"}
              </SelectLabel>
              {otherItems.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs text-slate-700 py-2 cursor-pointer hover:bg-slate-50 focus:bg-blue-50 focus:text-blue-700"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
