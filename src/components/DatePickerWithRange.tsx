import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/Popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "src/utils/cn";
import { Button } from "./shadcn/Button";
import { format } from "date-fns";
import { Calendar } from "./shadcn/Calendar";

export function DatePickerWithRange({
  className,
  date,
  set_date,
}: {
  className?: string;
  date: DateRange | undefined;
  set_date: (new_date: DateRange | undefined) => void;
}) {

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start border border-slate-400 text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from && date.to && (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            )}
            {date?.from && !date.to && format(date.from, "LLL dd, y")}
            {!date?.from && !date?.to && <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto border-none bg-white p-0 dark:bg-leblanc"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={set_date}
            numberOfMonths={2}
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
