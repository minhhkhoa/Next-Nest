"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RatingSliderProps {
  value: number;
  onChange: (val: number | undefined) => void;
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleValueChange = (val: number[]) => {
    setLocalValue(val[0]);
    onChange(val[0] === 0 ? undefined : val[0]);
  };

  return (
    <div className="w-full md:w-5/12 flex items-center gap-4 bg-muted/30 px-6 py-4 rounded-lg border">
      <span className="text-sm font-medium whitespace-nowrap min-w-[140px]">
        Điểm tiềm năng: {localValue}
      </span>
      <div className="flex-1 px-4 relative">
        <Slider
          defaultValue={[0]}
          max={100}
          step={1}
          value={[localValue]}
          onValueChange={handleValueChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
