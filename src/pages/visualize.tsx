import { format, subDays, subYears } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Spinner } from "src/components/Spinner";
import { GetExpensesOverDateRangeRet } from "src/server/api/routers/router";
import { api } from "src/utils/api";
import { cents_to_dollars_display } from "src/utils/centsToDollarDisplay";
import { cn } from "src/utils/cn";
import { BaseColor } from "src/utils/colors";
import { TW_COLORS_TO_HEX_MP } from "src/utils/tailwindColorsToHexMp";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/shadcn/Popover";
import { Button } from "src/components/shadcn/Button";
import { Calendar } from "src/components/shadcn/Calendar";
import { SIGN_IN_ROUTE } from "src/utils/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "src/components/Layout";
import { getServerAuthSession } from "src/server/auth";
import { GetServerSideProps } from "next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import { SPINNER_CLASSNAMES } from ".";
import { useWindowDimensions } from "src/utils/useWindowDimensions";
import { breakpoints } from "src/utils/tailwindBreakpoints";
import { DatePickerWithRange } from "src/components/DatePickerWithRange";
import { use_jason } from "src/utils/useExpenses";
import { date_to_dmy } from "./expenses";

//I should probably understand how this works, but I just ripped it from https://create.t3.gg/en/usage/next-auth
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
export default function Visualize() {
  const session = useSession();
  const router = useRouter();
  // const week_ago_date = subDays(new Date(), 7);
  const year_ago = subYears(new Date(), 1);
  const today_date = new Date();
  const [date, set_date] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  }); //Default to the past week

  console.log(year_ago, today_date);
  const windowDimensions = useWindowDimensions();
  const expense_data_query = use_jason({
    from_date: date_to_dmy(date?.from ?? undefined),
    to_date: date_to_dmy(date?.to ?? undefined),
  });

  console.log("expense_data_query", expense_data_query.data);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push(SIGN_IN_ROUTE);
    }
  }, [session.status]);
  if (session.status === "loading" || session.status === "unauthenticated") {
    return (
      <div className="bg-charmander dark:bg-khazix flex h-screen items-center justify-center p-1 md:p-4">
        <Spinner className={SPINNER_CLASSNAMES} />
      </div>
    );
  }

  if (expense_data_query.status === "loading") {
    return (
      <div className="flex h-[95vh] items-center justify-center">
        <Spinner className={SPINNER_CLASSNAMES} />
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

  console.log("windowDimensions", windowDimensions);
  console.log("expense_data_query", expense_data_query.data);
  const filtered = filterData(expense_data_query.data, date);
  console.log("filtered", filtered);
  const pie_chart_data = get_pie_chart_data(get_data_intermediate(filtered));
  const { global_total } = get_data_intermediate(filtered);
  return (
    <Layout>
      <div className="flex h-[10vh] items-center pl-4">
        <DatePickerWithRange date={date} set_date={set_date} />
      </div>
      <div className="flex h-[83vh] flex-col items-center md:h-[80vh] md:flex-row md:items-start">
        <div className="min-h-[50%] w-[92%] rounded-md px-4 dark:bg-khazix md:h-[100%] md:w-[50%]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={100} height={100}>
              <Pie
                data={pie_chart_data}
                innerRadius={
                  windowDimensions.width &&
                  windowDimensions.width <= breakpoints["md"]
                    ? 80
                    : 160
                }
                outerRadius={
                  windowDimensions.width &&
                  windowDimensions.width <= breakpoints["md"]
                    ? 120
                    : 220
                }
                paddingAngle={2}
                dataKey="value"
              >
                {pie_chart_data.map((datum, i) => (
                  <Cell
                    key={`${datum.name}-${i}`}
                    fill={TW_COLORS_TO_HEX_MP[datum.color]["500"]}
                    stroke="none"
                    className="hover:brightness-125 focus:outline-none focus:brightness-125"
                    // style={{ border: "1px solid red" }}
                  />
                ))}
              </Pie>
              <Tooltip
                wrapperClassName="bg-red-500 p-0"
                contentStyle={{
                  fontStyle: "italic",
                  backgroundColor: "blue",
                }}
                content={(v) => {
                  const stuff = v.payload ? v.payload[0] : null;
                  console.log("wtf", stuff);
                  if (!stuff) {
                    return null;
                  }
                  const col = stuff.payload.color as BaseColor;
                  console.log("col", col);
                  return (
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 font-semibold",
                        TW_COLORS_MP["text"][col]["700"],
                        TW_COLORS_MP["bg"][col]["200"]
                      )}
                    >
                      {stuff.name}
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-[100%] gap-1 pr-2 md:flex md:h-[100%] md:w-[50%] md:flex-col md:p-0">
          <div className="ml-2 px-4 text-xl font-bold text-squirtle dark:text-rengar md:h-[5%]">
            Total: {cents_to_dollars_display(global_total)}
          </div>
          <div className="h-2 md:h-0" />
          <ul
            className={cn(
              "thin-scrollbar mr-4 flex w-[100%] flex-col dark:bg-khazix md:h-[95%]",
              "min-h-0 grow gap-2 rounded pl-5 pr-2 md:m-0 md:overflow-scroll md:px-4 md:py-0"
            )}
          >
            {pie_chart_data.map((datum) => {
              return (
                <li
                  className={cn(
                    "bg-bulbasaur dark:bg-leblanc flex items-center gap-3",
                    "dark:shadow-leblanc rounded-lg font-bold shadow-sm shadow-slate-300"
                  )}
                >
                  <div className={cn("flex items-center gap-4 p-4")}>
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full",
                        TW_COLORS_MP["bg"][datum.color]["500"]
                      )}
                    />
                    <p className={cn(TW_COLORS_MP["text"][datum.color]["500"])}>
                      {datum.name}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
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

function filterData(
  days_and_ec: GetExpensesOverDateRangeRet,
  dateRange: DateRange | undefined
): GetExpensesOverDateRangeRet {
  if (!dateRange || !dateRange.from) {
    return { days: [], expense_categories: days_and_ec.expense_categories };
  }
  const from = dateRange.from;
  const to = dateRange.to ?? from;

  const from_day = from.getDate();
  const from_month_idx = from.getMonth();
  const from_year = from.getFullYear();

  const to_day = to.getDate();
  const to_month_idx = to.getMonth();
  const to_year = to.getFullYear();

  let filtered_days = [];
  filtered_days = days_and_ec.days.filter((d) => {
    if (d.year < from_year || d.year > to_year) {
      return false;
    }
    if (d.year > from_year && d.year < to_year) {
      return true;
    }
    let is_after_from = true;
    if (d.year === from_year) {
      const is_after_month = d.month > from_month_idx;
      const same_month_but_after_day =
        d.month === from_month_idx && d.day >= from_day;
      is_after_from = is_after_month || same_month_but_after_day;
    }
    let is_before_to = true;
    if (d.year === to_year) {
      const is_before_month = d.month < to_month_idx;
      const is_same_month_but_before_day =
        d.month === to_month_idx && d.day <= to_day;
      is_before_to = is_before_month || is_same_month_but_before_day;
    }
    return is_after_from && is_before_to;
  });
  return {
    days: filtered_days,
    expense_categories: days_and_ec.expense_categories,
  };
}

function get_data_intermediate(
  days_and_ec: GetExpensesOverDateRangeRet
): IntResp {
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
      value: d.total / input.global_total,
      name: `${d.name} - ${cents_to_dollars_display(d.total)} (${(
        Math.floor((d.total / input.global_total) * 10000) / 100
      ).toLocaleString()}%)`,
      color: d.color,
    };
  });
  return out;
}
