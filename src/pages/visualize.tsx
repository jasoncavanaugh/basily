import { subDays } from "date-fns";
import { Dispatch, SetStateAction, memo, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Spinner } from "src/components/Spinner";
import {
  ExpenseCategoryWithBaseColor,
  GetExpensesOverDateRangeRet,
} from "src/server/api/routers/router";
import { cents_to_dollars_display } from "src/utils/centsToDollarDisplay";
import { cn } from "src/utils/cn";
import { BaseColor } from "src/utils/colors";
import { TW_COLORS_TO_HEX_MP } from "src/utils/tailwindColorsToHexMp";
import { SIGN_IN_ROUTE, SPINNER_CLASSES } from "src/utils/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "src/components/Layout";
import { getServerAuthSession } from "src/server/auth";
import { GetServerSideProps } from "next";
import { use_expenses_over_date_range } from "src/utils/useExpenses";
import { date_to_dmy } from "./expenses";
import { api } from "src/utils/api";
import { useCallback, useRef } from "react";
import { UseExpensesOverDateRangeData } from "src/utils/useExpenses";
import { useWindowDimensions } from "src/utils/useWindowDimensions";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { breakpoints } from "src/utils/tailwindBreakpoints";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import { DatePickerWithRange } from "src/components/DatePickerWithRange";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};

const MemoizedPie = memo(
  ({
    pie_chart_data,
    selected_categories,
    window_width,
  }: {
    pie_chart_data: Array<{
      category_id: string;
      value: number;
      name: string;
      color: BaseColor;
    }>;
    selected_categories: Array<string>;
    window_width?: number;
  }) => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={100} height={100}>
          <Pie
            animationDuration={800}
            animationEasing="ease-in-out"
            data={pie_chart_data.filter((pcd) =>
              selected_categories.includes(pcd.category_id)
            )}
            innerRadius={
              window_width && window_width <= breakpoints["md"] ? 80 : 160
            }
            outerRadius={
              window_width && window_width <= breakpoints["md"] ? 120 : 220
            }
            paddingAngle={2}
            dataKey="value"
          >
            {pie_chart_data
              .filter((pcd) => selected_categories.includes(pcd.category_id))
              .map((datum, i) => {
                return (
                  <Cell
                    key={`${datum.name}-${i}`}
                    fill={TW_COLORS_TO_HEX_MP[datum.color]["500"]}
                    stroke="none"
                    className="hover:brightness-125 focus:outline-none focus:brightness-125"
                  />
                );
              })}
          </Pie>
          <Tooltip
            wrapperClassName="bg-red-500 p-0"
            contentStyle={{
              fontStyle: "italic",
              backgroundColor: "blue",
            }}
            content={(v) => {
              const stuff = v.payload ? v.payload[0] : null;
              if (!stuff) {
                return null;
              }
              const col = stuff.payload.color as BaseColor;
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
    );
  },
  (prev, next) => {
    const same_window_width = prev.window_width === next.window_width;
    if (!same_window_width) {
      return false;
    }
    const pdsorted = [...prev.pie_chart_data].sort();
    const ndsorted = [...next.pie_chart_data].sort();
    let same_length = pdsorted.length === ndsorted.length;
    if (!same_length) {
      return false;
    }
    for (let i = 0; i < pdsorted.length; i++) {
      const d = pdsorted[i]!;
      const o = ndsorted[i]!;
      if (
        d.category_id !== o.category_id ||
        d.color !== o.color ||
        d.name !== o.name
      ) {
        return false;
      }
    }
    const pcsorted = [...prev.selected_categories].sort();
    const ncsorted = [...next.selected_categories].sort();
    same_length = pcsorted.length === ncsorted.length;
    if (!same_length) {
      return false;
    }

    for (let i = 0; i < pcsorted.length; i++) {
      if (pcsorted[i] !== ncsorted[i]) {
        return false;
      }
    }
    return true;
  }
);
export default function Visualize() {
  const session = useSession();
  const router = useRouter();

  const today_date = new Date();
  const [date, set_date] = useState<DateRange | undefined>({
    from: subDays(today_date, 7),
    to: today_date,
  }); //Default to the past week

  const date_range =
    date && date?.from && date?.to //if from and to dates are selected...
      ? { from_date: date_to_dmy(date.from), to_date: date_to_dmy(date.to) } //...send over date range
      : undefined; //...otherwise not

  const expense_data_qry = use_expenses_over_date_range(date_range);
  const categories_qry = api.router.get_categories.useQuery();
  const [selected_categories, set_selected_categories] = useState<
    Array<string>
  >(categories_qry.data?.map((c) => c.id) ?? []);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push(SIGN_IN_ROUTE);
    }
  }, [session.status]);
  if (session.status === "loading" || session.status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
        <Spinner className={SPINNER_CLASSES} />
      </div>
    );
  }

  if (
    expense_data_qry.status === "error" ||
    categories_qry.status === "error"
  ) {
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

  if (
    expense_data_qry.status === "loading" ||
    categories_qry.status === "loading"
  ) {
    return (
      <div className="flex h-[95vh] items-center justify-center">
        <Spinner className={SPINNER_CLASSES} />
      </div>
    );
  }

  return (
    <VisualizeContent
      expenses_over_date_range={expense_data_qry.data}
      date={date}
      set_date={set_date}
      all_categories={categories_qry.data}
    />
  );
}

export function VisualizeContent({
  expenses_over_date_range,
  date,
  set_date,
  all_categories,
}: {
  expenses_over_date_range: UseExpensesOverDateRangeData;
  date?: DateRange;
  set_date: Dispatch<SetStateAction<DateRange | undefined>>;
  all_categories: Array<ExpenseCategoryWithBaseColor>;
}) {
  const windowDimensions = useWindowDimensions();
  const [selected_categories, set_selected_categories] = useState(
    all_categories.map((c) => c.id)
  );
  const filtered = filter_data_over_date_range(expenses_over_date_range, date);
  const intermediate = get_data_intermediate(filtered, selected_categories);
  const pie_chart_data = get_pie_chart_data(intermediate, selected_categories);
  const { global_total } = intermediate;

  return (
    <Layout>
      <div className="flex h-[95%] flex-col gap-1">
        <div className="flex h-[10vh] items-center pl-4">
          <DatePickerWithRange date={date} set_date={set_date} />
        </div>
        <div className="flex h-[83vh] flex-col items-center md:h-[80vh] md:flex-row md:items-start">
          <div className="min-h-[50%] w-[92%] rounded-md px-4 dark:bg-khazix md:h-[100%] md:w-[50%]">
            <MemoizedPie
              pie_chart_data={pie_chart_data}
              selected_categories={selected_categories}
              window_width={windowDimensions.width}
            />
          </div>
          <div className="w-[100%] gap-1 pr-2 md:flex md:h-[100%] md:w-[50%] md:flex-col md:p-0">
            <div className="ml-2 px-4 text-xl font-bold text-squirtle dark:text-rengar md:h-[5%]">
              Total: {cents_to_dollars_display(global_total)}
            </div>
            <div className="h-2 md:h-0" />
            <ul
              className={cn(
                "mr-4 flex w-[100%] flex-col dark:bg-khazix md:h-[95%]",
                "min-h-0 grow gap-2 rounded pl-5 pr-2 md:m-0 md:overflow-auto md:px-4 md:py-0"
              )}
            >
              {pie_chart_data
                .sort((a, b) => (a.name < b.name ? -1 : 1))
                .map((datum) => {
                  const is_selected = selected_categories.includes(
                    datum.category_id
                  );
                  return (
                    <li
                      className={cn(
                        "flex items-center gap-3 bg-bulbasaur dark:bg-leblanc",
                        "rounded-lg font-bold shadow-sm shadow-slate-300 dark:shadow-leblanc",
                        !is_selected && "opacity-50"
                      )}
                    >
                      <div className={cn("flex items-center gap-4 p-4")}>
                        <button
                          onClick={() => {
                            let new_selected_categories = [];
                            if (is_selected) {
                              new_selected_categories = [
                                ...selected_categories.filter(
                                  (sc) => sc !== datum.category_id
                                ),
                              ];
                            } else {
                              new_selected_categories = [
                                ...selected_categories,
                              ];
                              new_selected_categories.push(datum.category_id);
                            }
                            set_selected_categories(new_selected_categories);
                          }}
                          className={cn(
                            "h-4 w-4 rounded-full border",
                            TW_COLORS_MP["border"][datum.color]["500"],
                            is_selected &&
                              TW_COLORS_MP["bg"][datum.color]["500"]
                          )}
                          type="button"
                        />
                        <p
                          className={cn(
                            TW_COLORS_MP["text"][datum.color]["500"]
                          )}
                        >
                          {datum.name}
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

//For now...
type IntResp = {
  global_total: number;
  props: Array<{
    category_id: string;
    name: string;
    color: BaseColor;
    total: number;
  }>;
};

function filter_data_over_date_range(
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
  days_and_ec: GetExpensesOverDateRangeRet,
  selected_categories: Array<string>
): IntResp {
  const out: Record<
    string,
    { category_id: string; name: string; color: BaseColor; total: number }
  > = {};
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
      const is_category_selected = selected_categories.includes(e.category_id);
      if (!out[e.category_id]) {
        out[e.category_id] = {
          category_id: e.category_id,
          name: category_id_to_name[e.category_id]!,
          color: category_id_to_color[e.category_id]!,
          total: 0,
        };
      }
      out[e.category_id]!.total += e.amount;
      if (is_category_selected) {
        global_total += e.amount;
      }
    }
  }
  return { global_total, props: Object.values(out) };
}

function get_pie_chart_data(
  input: IntResp,
  selected_categories: Array<string>
) {
  return input.props.map((d) => {
    let name = `${d.name} - ${cents_to_dollars_display(d.total)}`;
    const is_category_selected = selected_categories.includes(d.category_id);
    if (is_category_selected) {
      name += ` (${(
        Math.floor((d.total / input.global_total) * 10000) / 100
      ).toLocaleString()}%)`;
    }

    return {
      category_id: d.category_id,
      value: d.total / input.global_total,
      name: name,
      color: d.color,
    };
  });
}
