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

  const dots = [0, 1, 2, 3, 4, 5];

  const handleValueChange = (val: number[]) => {
    setLocalValue(val[0]);
    onChange(val[0] === 0 ? undefined : val[0]);
  };

  return (
    <div className="w-full md:w-5/12 flex items-center gap-4 bg-muted/30 px-6 py-4 rounded-lg border">
      <span className="text-sm font-medium whitespace-nowrap min-w-[140px]">
        Mức độ tiềm năng: {localValue} sao
      </span>
      <div className="flex-1 px-4 relative mt-1">
        {/* Slider Component */}
        <div className="relative w-full z-10">
          <Slider
            defaultValue={[0]}
            max={5}
            step={1}
            value={[localValue]}
            onValueChange={handleValueChange}
            className="w-full"
          />
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none z-20">
          {dots.map((dotValue) => (
            <TooltipProvider key={dotValue}>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  {/* Dấu chấm - Bật pointer-events-auto trên thẻ này để bắt hover */}
                  <div
                    className="w-3 h-3 rounded-full bg-border transition-colors pointer-events-auto cursor-pointer"
                    style={{
                      // Đổi màu nếu dotValue <= giá trị hiện tại
                      backgroundColor:
                        dotValue <= localValue
                          ? "var(--primary)"
                          : "var(--muted-foreground)",
                      opacity: dotValue <= localValue ? 1 : 0.4,
                    }}
                    onClick={() => handleValueChange([dotValue])}
                  ></div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {dotValue} sao
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
}
