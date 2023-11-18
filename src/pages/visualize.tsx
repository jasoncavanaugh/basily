import { format, subDays } from "date-fns";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Spinner } from "src/components/Spinner";
import { Ugh } from "src/server/api/routers/router";
import { api } from "src/utils/api";
import { cents_to_dollars_display } from "src/utils/centsToDollarDisplay";
import { cn } from "src/utils/cn";
import { BaseColor } from "src/utils/colors";
import { TW_COLORS_TO_HEX_MP } from "src/utils/tailwindColorsToHexMp";
import { VictoryPie, VictoryTooltip } from "victory";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/shadcn/Popover";
import { Button } from "src/components/shadcn/Button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "src/components/shadcn/Calendar";
import { SIGN_IN_ROUTE } from "src/utils/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "src/components/Layout";
import { getServerAuthSession } from "src/server/auth";
import { GetServerSideProps } from "next";

//I should probably understand how this works, but I just ripped it from https://create.t3.gg/en/usage/next-auth
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
export default function Visualize() {
  //const expense_data_query = use_expenses();
  const session = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const week_ago_date = subDays(new Date(), 7);
  const today_date = new Date();
  const [date, set_date] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  }); //Default to the past week
  const expense_data_query = api.router.get_expenses_over_date_range.useQuery({
    from_date: {
      day: date && date.from ? date.from.getDate() : week_ago_date.getDate(),
      month_idx:
        date && date.from ? date.from?.getMonth() : week_ago_date.getMonth(),
      year:
        date && date.from
          ? date.from?.getFullYear()
          : week_ago_date.getFullYear(),
    },
    to_date: {
      day: date && date.to ? date.to.getDate() : today_date.getDate(),
      month_idx: date && date.to ? date.to.getMonth() : today_date.getMonth(),
      year: date && date.to ? date.to.getFullYear() : today_date.getFullYear(),
    },
  });


  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push(SIGN_IN_ROUTE);
    }
  }, [session.status]);
  if (session.status === "loading" || session.status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
        <Spinner className="h-16 w-16 border-4 border-solid border-pikachu dark:border-rengar dark:border-rengar_light lg:border-8" />
      </div>
    );
  }

  if (expense_data_query.status === "loading") {
    return (
      <div className="flex h-[95vh] items-center justify-center">
        <Spinner className="h-16 w-16 border-4 border-solid border-pikachu dark:border-rengar dark:border-rengar_light lg:border-8" />
      </div>
    );
  }
  if (expense_data_query.status === "error") {
    return (
      <Layout>
      <div className="flex h-[95vh] items-center justify-center">
        <h1 className="text-white">
          Uh oh, there was a problem loading your expenses.
        </h1>
      </div>
      </Layout>
    );
  }

  console.log("expense_data_query", expense_data_query.data);
  return (
    <Layout>
      <DatePickerWithRange date={date} set_date={set_date} />
      <div className="flex h-[85vh] flex-col items-center justify-center bg-pikachu dark:bg-leblanc md:flex-row">
        <div className="w-1/2">
          <VictoryPie
            labels={[]}
            padAngle={5}
            innerRadius={70}
            labelComponent={
              <VictoryTooltip
                // flyoutWidth={65}
                // flyoutHeight={35}
                cornerRadius={5}
                // center={{
                //   x: 0,
                //   y: 0
                // }}
                flyoutPadding={{ top: 5, bottom: 5, left: 10, right: 10 }}
                pointerLength={0}
                flyoutStyle={{
                  strokeWidth: 0,
                  fill: ({ datum }) => {
                    const color = datum.color.join("");
                    return TW_COLORS_TO_HEX_MP[color as BaseColor]["200"];
                  },
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}
                // @ts-ignore
                style={{
                  fill: ({ datum }: { datum: any }) => {
                    const color = datum.color.join("");
                    return TW_COLORS_TO_HEX_MP[color as BaseColor][
                      "700"
                    ] as string;
                  },
                  fontSize: 10,
                  fontWeight: 600,
                  textAnchor: "middle",
                }}
              />
            }
            // style={{
            //   labels: {
            //     fontSize: 8,
            //     fill: theme === "dark" ? "white" : "black",
            //   },
            // }}
            radius={100}
            colorScale={get_colors(
              get_data_intermediate(expense_data_query.data)
            )}
            animate={{
              animationWhitelist: ["style", "data", "size"], // Try removing "size"
              onExit: {
                duration: 500,
                before: () => ({ opacity: 0.3, _y: 0 }),
              },
              onEnter: {
                duration: 500,
                before: () => ({ opacity: 0.3, _y: 0 }),
                after: (datum) => ({ opacity: 1, _y: datum._y }),
              },
            }}
            // labelComponent={<VictoryLabel className="border bg-red-700 px-4" />}
            // data={[
            //   { y: 75, label: "jason" },
            //   { y: 5, label: "maureen" },
            //   { y: 20, label: "jeremy" },
            // ]}
            data={get_pie_chart_data(
              get_data_intermediate(expense_data_query.data)
            )}
          />
        </div>
        <div className="flex w-[50%] flex-col gap-3 border">
          <div className="flex items-center gap-2 rounded p-4 font-bold">
            <div className="h-4 w-4 rounded-full bg-pink-500" />
            <p>Groceries</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function get_colors(input: IntResp) {
  return input.props.map((d) => TW_COLORS_TO_HEX_MP[d.color]["500"]);
}

//For now...
type IntResp = {
  global_total: number;
  props: {
    name: string;
    color: BaseColor;
    total: number;
  }[];
};
function get_data_intermediate(days_and_ec: Ugh): IntResp {
  const out: Record<string, { name: string; color: BaseColor; total: number }> =
    {};
  const category_id_to_color: Record<string, BaseColor> = {};
  for (const ec of days_and_ec.expense_categories) {
    category_id_to_color[ec.id] = ec.color;
  }
  const category_id_to_name: Record<string, string> = {};
  for (const ec of days_and_ec.expense_categories) {
    category_id_to_name[ec.id] = ec.name;
  }

  let global_total = 0;
  for (const d of days_and_ec.days) {
    for (const e of d.expenses) {
      if (!out[e.category_id]) {
        out[e.category_id] = {
          name: category_id_to_name[e.category_id]!,
          color: category_id_to_color[e.category_id]!,
          total: 0,
        };
      }
      out[e.category_id]!.total += e.amount;
      global_total += e.amount;
    }
  }
  // Object.values(out);
  return { global_total, props: Object.values(out) };
}

function get_pie_chart_data(input: IntResp) {
  const out = input.props.map((d) => {
    const c = d.color;
    return {
      y: d.total / input.global_total,
      label: `${d.name} - ${cents_to_dollars_display(d.total)} (${Math.floor(
        (d.total / input.global_total) * 100
      ).toLocaleString()}%)`,
      color: d.color.split(""), //Because Victory is the weirdest fucking library
    };
  });
  return out;
}

function DatePickerWithRange({
  className,
  date,
  set_date,
}: {
  className?: string;
  date: DateRange | undefined;
  set_date: (new_date: DateRange | undefined) => void;
}) {
  // const [date, setDate] = useState<DateRange | undefined>({
  //   from: subDays(new Date(), 7),
  //   to: new Date()
  // });//Default to the past week

  return (
    <div className={cn("grid gap-2")}>
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
