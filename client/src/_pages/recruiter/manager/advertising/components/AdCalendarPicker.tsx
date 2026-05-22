"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react";
import { format, addDays, isWithinInterval, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { vi } from "date-fns/locale";

interface AdCalendarPickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  busyDates: { startAt: string; endAt: string }[];
  duration: number;
  maxDuration: number;
}

export default function AdCalendarPicker({
  date,
  setDate,
  busyDates,
  duration,
  maxDuration,
}: AdCalendarPickerProps) {
  //- Chuyển đổi busyDates sang dạng mảng Interval để dễ kiểm tra
  const disabledIntervals = React.useMemo(() => {
    return busyDates.map((b) => ({
      from: startOfDay(new Date(b.startAt)),
      to: startOfDay(new Date(b.endAt)),
    }));
  }, [busyDates]);

  //- Kiểm tra một ngày cụ thể có bị vô hiệu hóa không (chỉ vô hiệu hóa ngày quá khứ/hôm nay)
  const isDateDisabled = (day: Date) => {
    const today = startOfDay(new Date());
    return day <= today; //- Không cho chọn ngày quá khứ hoặc hôm nay (cần ít nhất 1 ngày chuẩn bị)
  };

  //- Kiểm tra xem nếu chọn ngày này thì khoảng thời gian 'duration' ngày tiếp theo có bị trùng không
  const hasOverlapConflict = React.useMemo(() => {
    if (!date || duration <= 0) return false;

    const start = startOfDay(date);
    const end = addDays(start, duration - 1);

    // Kiểm tra từng ngày trong khoảng được chọn
    for (let i = 0; i < duration; i++) {
      const currentDay = addDays(start, i);
      if (
        disabledIntervals.some((interval) =>
          isWithinInterval(currentDay, { start: interval.from, end: interval.to }),
        )
      ) {
        return true;
      }
    }

    return false;
  }, [date, duration, disabledIntervals]);

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              hasOverlapConflict &&
                "border-red-500 text-red-600 hover:text-red-600",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: vi })
            ) : (
              <span>Chọn ngày bắt đầu</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={isDateDisabled}
            modifiers={{
              booked: (day) =>
                disabledIntervals.some((interval) =>
                  isWithinInterval(day, {
                    start: interval.from,
                    end: interval.to,
                  }),
                ),
            }}
            components={{
              DayButton: (props) => {
                const { modifiers, className, ...rest } = props;
                return (
                  <CalendarDayButton
                    {...rest}
                    modifiers={modifiers}
                    className={cn(
                      className,
                      modifiers.booked &&
                        "bg-destructive/20 text-destructive font-bold border border-destructive/30 rounded-md !opacity-100 shadow-sm",
                    )}
                  />
                );
              },
            }}
            initialFocus
            locale={vi}
          />
          {/* Legend */}
          <div className="flex items-center gap-4 p-3 border-t bg-muted/20">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-destructive/20 border border-destructive/30 rounded-sm"></div>
              <span className="text-[10px] font-medium text-muted-foreground">Đã được đặt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <span className="text-[10px] font-medium text-muted-foreground">Ngày bạn chọn</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasOverlapConflict && (
        <div className="flex items-center gap-2 text-red-500 text-[11px] font-medium bg-red-50 p-2 rounded border border-red-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Khoảng thời gian {duration} ngày kể từ ngày này đã có lịch đặt. Vui
            lòng chọn ngày khác.
          </span>
        </div>
      )}
    </div>
  );
}
