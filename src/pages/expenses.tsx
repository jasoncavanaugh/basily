import { Expense } from "@prisma/client";
import * as RadixPopover from "@radix-ui/react-popover";
import * as RadixModal from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactHTMLElement, ReactNode, useEffect, useState } from "react";
import { Spinner } from "src/components/Spinner";
import { api } from "src/utils/api";
import { cents_to_dollars_display } from "src/utils/centsToDollarDisplay";
import { cn } from "src/utils/cn";
import { BASE_COLORS, BaseColor } from "src/utils/colors";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import {
  DMY,
  ExpenseDataByDay,
  process_days_with_expenses,
  use_expenses,
  use_jason,
} from "src/utils/useExpenses";
import Layout from "src/components/Layout";
import {
  BUTTON_HOVER_CLASSES,
  RADIX_MODAL_CONTENT_CLASSES,
  RADIX_MODAL_OVERLAY_CLASSES,
  SIGN_IN_ROUTE,
} from "src/utils/constants";
import { getServerAuthSession } from "src/server/auth";
import { GetServerSideProps } from "next";
import {
  DayWithExpenses,
  ExpenseCategoryWithBaseColor,
} from "src/server/api/routers/router";
import { SPINNER_CLASSNAMES } from ".";
import { TW_COLORS_TO_HEX_MP } from "src/utils/tailwindColorsToHexMp";
import { DatePickerWithRange } from "src/components/DatePickerWithRange";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { get_category_ids_to_names } from "src/utils/getCategoryIdsToNames";
import { get_category_ids_to_colors } from "src/utils/getCategoryIdsToColors";
import { getDayName } from "./sign-in";

//I should probably understand how this works, but I just ripped it from https://create.t3.gg/en/usage/next-auth
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};

export function date_to_dmy(date?: Date): DMY | undefined {
  if (!date) {
    return undefined;
  }

  return {
    year: date.getFullYear(),
    month_idx: date.getMonth(),
    day: date.getDate(),
  };
}
export default function Expenses() {
  const session = useSession();
  // const expense_data_query = use_expenses();
  const router = useRouter();
  const today = new Date();

  const [date, set_date] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  }); //Default to the past week

  const expense_data_query = use_jason({
    from_date: date_to_dmy(date?.from ?? undefined),
    to_date: date_to_dmy(date?.to ?? undefined),
  });

  // console.log("jason_res", jason_res);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push(SIGN_IN_ROUTE);
    }
  }, [session.status]);

  if (session.status === "loading" || session.status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
        <Spinner className={SPINNER_CLASSNAMES} />
      </div>
    );
  }
  const filtered_expenses_by_day = filter_over_selected_dates(
    expense_data_query.data?.days ?? [],
    date
  );
  return (
    <Layout>
      <div className="pt-4 px-4">
        <DatePickerWithRange date={date} set_date={set_date} />
      </div>
      {expense_data_query.status === "loading" && (
        <div className="flex h-[95vh] items-center justify-center">
          <Spinner className={SPINNER_CLASSNAMES} />
        </div>
      )}
      {expense_data_query.status === "error" && (
        <div className="flex h-[95vh] items-center justify-center">
          <h1 className="text-white">
            Uh oh, there was a problem loading your expenses.
          </h1>
        </div>
      )}
      {expense_data_query.status === "success" &&
        expense_data_query.data.days.length === 0 && (
          <div className="flex h-[95vh] items-center justify-center">
            <h1 className="text-slate-700 dark:text-white italic">
              Click the '+' button to add a new expense.
            </h1>
          </div>
        )}
      {expense_data_query.status === "success" &&
        expense_data_query.data.days.length > 0 &&
        filtered_expenses_by_day.length === 0 && (
          <div className="flex h-[95vh] items-center justify-center">
            <h1 className="text-slate-700 dark:text-white text-wrap p-4 flex justify-center text-center italic">
              No expenses found over selected date range
            </h1>
          </div>
        )}
      {expense_data_query.status === "success" &&
        expense_data_query.data.days.length > 0 &&
        filtered_expenses_by_day.length > 0 && (
          <ChronologicalExpenseList
            invalidate_expenses_qry={() => expense_data_query.invalidate()}
            date={date}
            set_date={set_date}
            expenses_by_day={process_days_with_expenses({
              days: filtered_expenses_by_day,
            })}
            category_id_to_name={get_category_ids_to_names(
              expense_data_query.data.expense_categories
            )}
            category_id_to_color={get_category_ids_to_colors(
              expense_data_query.data.expense_categories
            )}
          />
        )}
      <AddNewExpenseButtonAndModal
        triggerClassnames={cn(
          "fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-squirtle p-0 shadow shadow-blue-300 hover:cursor-pointer dark:bg-rengar",
          "md:bottom-14 md:right-14 md:h-14 md:w-14",
          "lg:shadow-md lg:shadow-blue-300 lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-lg lg:hover:shadow-blue-300 lg:hover:brightness-110"
        )}
        on_create_success={() => expense_data_query.invalidate()}
        month={today.getMonth() + 1}
        day={today.getDate()}
        year={today.getFullYear()}
      >
        {/* https://tailwindcomponents.com/component/tailwind-css-fab-buttons */}
        <svg
          viewBox="0 0 20 20"
          enableBackground="new 0 0 20 20"
          className={cn("inline-block h-6 w-6")}
        >
          <path
            fill="#FFFFFF"
            d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601 C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399 C15.952,9,16,9.447,16,10z"
          />
        </svg>
      </AddNewExpenseButtonAndModal>
    </Layout>
  );
}

function filter_over_selected_dates(days: DayWithExpenses[], date?: DateRange) {
  //Wtf typescript??
  if (!date) {
    return days.slice(0, 30);
  }
  const from = date.from;
  const to = date.to;
  if (!from || !to) {
    return days.slice(0, 30);
  }
  return days.filter((d) => {
    const from_year = from.getFullYear();
    const from_month_idx = from.getMonth();
    const from_day = from.getDate();

    const to_year = to.getFullYear();
    const to_month_idx = to.getMonth();
    const to_day = to.getDate();

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
}

function ChronologicalExpenseList({
  expenses_by_day,
  category_id_to_name,
  category_id_to_color,
  date,
  set_date,
  invalidate_expenses_qry,
}: {
  expenses_by_day: ExpenseDataByDay[];
  category_id_to_color: Map<string, BaseColor>;
  category_id_to_name: Map<string, string>;
  date: DateRange | undefined;
  set_date: (new_date: DateRange | undefined) => void;
  invalidate_expenses_qry: () => void;
}) {
  return (
    <div className="px-4">
      {expenses_by_day.map((dwe) => {
        const { month, day, year } = extract_mdy(dwe.date_display);
        return (
          <li key={dwe.id} className="py-2">
            <div className="flex items-end justify-between ">
              <AddNewExpenseButtonAndModal
                on_create_success={() => invalidate_expenses_qry()}
                triggerClassnames="hover:cursor-pointer hover:opacity-80 dark:hover:opacity-100 dark:hover:brightness-110"
                month={month}
                day={day}
                year={year}
              >
                <h1 className="inline rounded-lg bg-squirtle px-2 py-1 font-bold text-white dark:bg-rengar md:p-2">
                  {getDayName(new Date(year, month - 1, day).getDay())}{" "}
                  {dwe.date_display} +
                </h1>
              </AddNewExpenseButtonAndModal>
            </div>
            <div className="h-4" />
            <ul className="flex flex-col gap-3 rounded-lg bg-pikachu p-4 shadow-sm dark:bg-leblanc dark:shadow-sm dark:shadow-leblanc">
              <ExpenseListForDay
                day_with_expenses={dwe}
                // category_id_to_expenses_for_day={dwe.category_id_to_expenses}
                category_id_to_color={category_id_to_color}
                category_id_to_name={category_id_to_name}
                invalidate_expenses_qry={invalidate_expenses_qry}
              />
              <li className="flex justify-between">
                <p className="font-semibold text-squirtle dark:text-rengar">
                  Total:{" "}
                </p>
                <p className="font-semibold text-squirtle dark:text-rengar">
                  {cents_to_dollars_display(dwe.total_for_day)}
                </p>
              </li>
            </ul>
          </li>
        );
      })}
    </div>
  );
}

export function extract_mdy(date_display: `${number}-${number}-${number}`) {
  const [month, day, year] = date_display.split("-").map((d) => parseInt(d));
  if (!month || !day || !year) {
    throw new Error("extract_mdy: !month || !day || !year");
  }
  return { month, day, year };
}

function ExpenseListForDay({
  day_with_expenses,
  category_id_to_color,
  category_id_to_name,
  invalidate_expenses_qry,
}: {
  day_with_expenses: ExpenseDataByDay;
  category_id_to_color: Map<string, BaseColor>;
  category_id_to_name: Map<string, string>;
  invalidate_expenses_qry: () => void;
}) {
  let output = [];
  const category_id_to_expenses_for_day =
    day_with_expenses.category_id_to_expenses;

  const { month, day, year } = extract_mdy(day_with_expenses.date_display);
  for (const category_id of category_id_to_expenses_for_day.keys()) {
    const expense_list = category_id_to_expenses_for_day.get(category_id)!;
    const sum_of_expenses = expense_list.reduce((acc, e) => e.amount + acc, 0);
    const category_color = category_id_to_color.get(category_id)!;
    const category_name = category_id_to_name.get(category_id);
    output.push(
      <li key={category_id}>
        <div className="flex justify-between">
          <AddNewExpenseButtonAndModal
            on_create_success={() => invalidate_expenses_qry()}
            triggerClassnames="hover:cursor-pointer hover:opacity-80 dark:hover:opacity-100 dark:hover:brightness-110"
            month={month}
            day={day}
            year={year}
            expense_category_name={category_name}
            expense_category_color={category_color}
          >
            <h2
              className={cn(
                "flex items-center rounded-lg",
                "px-2 py-1 text-sm font-bold md:text-base ",
                TW_COLORS_MP["bg"][category_color][200],
                TW_COLORS_MP["text"][category_color][700]
              )}
            >
              {category_name} +
            </h2>
          </AddNewExpenseButtonAndModal>
          <p className="font-semibold text-squirtle dark:text-rengar">
            {cents_to_dollars_display(sum_of_expenses)}
          </p>
        </div>
        <ul className="flex flex-wrap gap-1 py-2">
          {expense_list.map((expense, i) => {
            return (
              <ExpenseButton
                key={i}
                expense={expense}
                category_color={category_color}
                on_delete={() => invalidate_expenses_qry()}
              />
            );
          })}
        </ul>
      </li>
    );
  }
  return <>{output}</>;
}

function ExpenseButton({
  expense,
  category_color,
  on_delete,
}: {
  expense: Expense;
  category_color: BaseColor;
  on_delete: () => void;
}) {
  const [is_modal_open, set_is_modal_open] = useState(false);
  // const expense_data_qry = use_expenses();
  const delete_expense_mutn = api.router.delete_expense.useMutation({
    onSuccess: () => {
      // expense_data_qry.invalidate_queries();
      on_delete();
      set_is_modal_open(false); //TODO: Have to figure out how to close the modal once the new data comes in
    },
    onError: () => {
      alert("error");
    },
  });

  return (
    <RadixModal.Root
      onOpenChange={() => {
        set_is_modal_open(!is_modal_open);
      }}
      open={is_modal_open}
    >
      <RadixModal.Trigger asChild>
        <li key={expense.id}>
          <button
            className={cn(
              TW_COLORS_MP["bg"][category_color][500],
              "rounded-full px-2 text-white hover:cursor-pointer hover:opacity-80 dark:hover:opacity-100 dark:hover:brightness-110"
            )}
            // title="Delete expense"
          >
            {cents_to_dollars_display(expense.amount)}
          </button>
        </li>
      </RadixModal.Trigger>
      <RadixModal.Portal>
        <RadixModal.Overlay className={RADIX_MODAL_OVERLAY_CLASSES} />
        <RadixModal.Content
          className={cn(
            RADIX_MODAL_CONTENT_CLASSES,
            "fixed left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded border-t-8 border-t-red-500 bg-pikachu dark:bg-leblanc",
            "px-5 py-3 md:top-1/2 md:w-[30rem] md:rounded-lg lg:px-8 lg:py-6"
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              delete_expense_mutn.mutate({ id: expense.id });
            }}
          >
            <RadixModal.Title className="whitespace-nowrap text-3xl font-bold text-slate-700 dark:text-white">
              Delete Expense
            </RadixModal.Title>
            <div className="h-1 lg:h-4" />
            <div className="flex w-full flex-col gap-4">
              Are you sure you wish to delete this expense?
            </div>
            <div className="h-8" />
            <div className="flex justify-center gap-5">
              <button
                className="h-[2rem] w-[4.5rem] rounded-full bg-slate-500 text-xs font-semibold text-white hover:brightness-110 lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold"
                type="button"
                onClick={() => set_is_modal_open(false)}
              >
                Cancel
              </button>
              <button
                className={cn(
                  "flex w-[4.5rem] items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold"
                )}
                type="submit"
              >
                {delete_expense_mutn.status === "loading" && (
                  <Spinner className="h-4 w-4 border-2 border-solid border-white lg:h-5 lg:w-5" />
                )}
                {delete_expense_mutn.status !== "loading" && "Delete"}
              </button>
            </div>
          </form>
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );
}

const AMOUNT_REGEX = new RegExp(/^\d*(\.\d\d)?$/);
export function is_valid_amount(amount: string) {
  const is_zero_amount =
    amount.split("").filter((c) => c !== "." && c !== "0").length === 0;
  return AMOUNT_REGEX.test(amount) && !is_zero_amount;
}
const DATE_REGEX = new RegExp(
  /^(0?[1-9]|1[012])[/](0?[1-9]|[12][0-9]|3[01])[/](19|20)\d\d$/
);
export function is_valid_date(date_str: string) {
  return DATE_REGEX.test(date_str);
}
function extract_date_fields(date_str: string) {
  if (!is_valid_date(date_str)) {
    throw new Error(
      "Invalid date string passed to 'extract_date_fields' function"
    );
  }
  const split = date_str.trim().split("/");
  return {
    day: parseInt(split[1]!),
    month_idx: parseInt(split[0]!) - 1,
    year: parseInt(split[2]!),
  };
}

function AddNewExpenseButtonAndModal({
  on_create_success,
  triggerClassnames,
  month,
  day,
  year,
  expense_category_name,
  expense_category_color,
  children,
}: {
  on_create_success: () => void;
  triggerClassnames: string;
  month: number;
  day: number;
  year: number;
  expense_category_name?: string;
  expense_category_color?: BaseColor;
  children: ReactNode;
}) {
  const [amount, set_amount] = useState("");
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [category_text, set_category_text] = useState(
    expense_category_name ?? ""
  );
  const [is_category_dropdown_open, set_is_category_dropdown_open] =
    useState(false);
  const [color, set_color] = useState<BaseColor>(
    expense_category_color ?? "pink"
  );
  const [date, set_date] = useState(`${month}/${day}/${year}`);
  const [is_color_selection_open, set_is_color_selection_open] =
    useState(false);

  // const expense_data_qry = use_expenses();
  const expense_categories_qry = api.router.get_categories.useQuery();
  const a = expense_categories_qry.data;

  const create_expense_mtn = api.router.create_expense.useMutation({
    onSuccess: () => {
      set_is_modal_open(false);
      on_create_success();
    },
    onError: (err, data, ctx) => {
      console.log(err, data);
      alert("error");
    },
  });
  const create_category_and_expense_mtn =
    api.router.create_category.useMutation({
      onSuccess: (data) => {
        create_expense_mtn.mutate({
          category_id: data.id,
          amount: amount,
          date: extract_date_fields(date),
        });
      },
      onError: () => {
        alert("error in create_caegory_and_expense");
      },
    });

  function handle_create_expense(
    expense_categories: ExpenseCategoryWithBaseColor[]
  ) {
    const does_category_exist =
      expense_categories.filter((exp) => exp.name === category_text).length > 0;
    if (!does_category_exist) {
      create_category_and_expense_mtn.mutate({
        name: category_text,
        color: color,
      });
    } else {
      const id = expense_categories.find((c) => c.name === category_text)?.id;
      if (!id) throw new Error("id undefined");
      create_expense_mtn.mutate({
        category_id: id,
        amount: amount,
        date: extract_date_fields(date),
      });
    }
  }
  if (expense_categories_qry.status === "error") {
    console.error(expense_categories_qry.error);
  }

  const is_create_expense_button_disabled =
    category_text.length === 0 ||
    color.length === 0 ||
    amount.length === 0 ||
    !is_valid_amount(amount) ||
    !is_valid_date(date) ||
    is_category_dropdown_open; //This is because if the dropdown is still open, that indicates that the user hasn't selected something yet

  const does_category_exist =
    expense_categories_qry.data?.filter((cat) => cat.name === category_text)
      .length !== 0;

  return (
    <RadixModal.Root
      onOpenChange={() => {
        //This is so dumb, I can't believe this is how the Radix modal works
        set_amount("");
        set_date(`${month}/${day}/${year}`);
        set_category_text(expense_category_name ?? "");
        set_color(expense_category_color ?? "pink");
        set_is_modal_open(!is_modal_open);
      }}
      open={is_modal_open}
    >
      <RadixModal.Trigger asChild>
        <button
          type="button"
          disabled={
            expense_categories_qry.status === "loading" ||
            expense_categories_qry.status === "error"
          }
          onClick={() => set_is_modal_open(true)}
          className={triggerClassnames}
        >
          {children}
        </button>
      </RadixModal.Trigger>
      <RadixModal.Portal>
        <RadixModal.Overlay className={RADIX_MODAL_OVERLAY_CLASSES} />
        <RadixModal.Content
          className={cn(
            RADIX_MODAL_CONTENT_CLASSES,
            "fixed left-1/2 top-0 w-full -translate-x-1/2 rounded border-t-8 border-t-squirtle bg-pikachu dark:border-t-rengar dark:bg-leblanc",
            "p-4 md:top-1/2 md:w-[40rem] md:-translate-y-1/2 md:rounded-lg lg:p-8"
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handle_create_expense(expense_categories_qry.data!);
            }}
          >
            <RadixModal.Title className="whitespace-nowrap text-3xl font-bold text-slate-700 dark:text-white">
              Add Expense
            </RadixModal.Title>
            <div className="h-1 lg:h-4" />
            <div className="w-full">
              <label
                htmlFor="amount"
                className="block text-slate-700 dark:text-white"
              >
                Amount
              </label>
              <div className="h-2" />
              <input
                name="amount"
                inputMode="text"
                placeholder="0.01"
                onChange={(e) => {
                  set_amount(e.target.value.trim());
                }}
                value={amount}
                className="w-full rounded border border-slate-400 px-2 py-1 focus:outline-slate-400"
                autoComplete="off"
                type="text"
              ></input>
              <div className="m-0 h-7">
                {amount.length > 0 && !is_valid_amount(amount) && (
                  <p className="text-sm text-red-500">Invalid amount</p>
                )}
              </div>
              <label htmlFor="date" className="block dark:text-white">
                Date
              </label>
              <div className="h-1" />
              <input
                name="date"
                inputMode="text"
                value={date}
                onChange={(e) => set_date(e.target.value)}
                className="w-full rounded border border-slate-400 px-2 py-1 focus:outline-slate-400"
                autoComplete="off"
                type="text"
              ></input>
              <div className="m-0 h-7">
                {!is_valid_date(date) && (
                  <p className="text-sm text-red-600">Invalid date</p>
                )}
              </div>
              <div className="h-1" />
              <label htmlFor="category" className="dark:text-white">
                Category
              </label>
              <div className="flex h-16 items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (does_category_exist) return;
                    set_is_color_selection_open(!is_color_selection_open);
                  }}
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full md:h-6 md:w-6",
                    TW_COLORS_MP["bg"][color][500],
                    does_category_exist
                      ? "hover:cursor-not-allowed"
                      : "hover:cursor-pointer hover:brightness-110"
                  )}
                ></button>
                {is_color_selection_open && (
                  <div
                    className={cn(
                      "flex grow flex-wrap items-center rounded-lg md:justify-between"
                      // "md:h-[200px] md:w-[150px] md:flex-col md:gap-1"
                    )}
                  >
                    {BASE_COLORS.map((option) => {
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => {
                            set_color(option);
                            set_is_color_selection_open(false);
                          }}
                          className={cn(
                            TW_COLORS_MP["bg"][option][500],
                            "h-5 w-5 rounded-full border-2",
                            "border-pikachu focus:border-black focus:outline-none dark:border-leblanc dark:focus:border-white",
                            option === color
                              ? "border-slate-900 brightness-110 hover:cursor-default dark:border-white"
                              : "hover:cursor-pointer  hover:border-slate-900 hover:brightness-110 dark:hover:border-white",
                            "md:h-7 md:w-7"
                          )}
                        />
                      );
                    })}
                  </div>
                )}
                {!is_color_selection_open && (
                  <div className="w-full">
                    <input
                      name="category"
                      value={category_text}
                      onChange={(e) => {
                        set_category_text(e.target.value);
                        set_is_category_dropdown_open(true);
                        // set_is_category_color_selection_disabled(false);
                      }}
                      className="w-full grow rounded border border-slate-400 px-2 py-1 focus:outline-slate-400"
                      autoComplete="off"
                      type="text"
                    ></input>
                    <div className="relative m-0 h-0 p-0">
                      {category_text.length > 0 &&
                        is_category_dropdown_open && (
                          <ul className="absolute z-20 flex max-h-[200px] w-full flex-col gap-2 overflow-y-scroll rounded border bg-white p-3 dark:bg-shaco">
                            {expense_categories_qry.data
                              ?.filter(
                                (cat) =>
                                  cat.name.includes(category_text) ||
                                  category_text.includes(cat.name)
                              )
                              .map((exp) => {
                                return (
                                  <li
                                    key={exp.id}
                                    className={cn(
                                      "flex items-center gap-3 rounded border border-squirtle_light px-3 py-2 dark:border-violet-300",
                                      BUTTON_HOVER_CLASSES
                                    )}
                                    onClick={() => {
                                      set_category_text(exp.name);
                                      set_color(exp.color);
                                      set_is_category_dropdown_open(false);
                                      // set_is_category_color_selection_disabled(true);
                                    }}
                                  >
                                    <div
                                      className={cn(
                                        "h-4 w-4 rounded-full",
                                        TW_COLORS_MP["bg"][exp.color][500]
                                      )}
                                    />
                                    <p>{exp.name}</p>
                                  </li>
                                );
                              })}
                            {category_text.length > 0 &&
                              !does_category_exist && (
                                <li
                                  className={cn(
                                    "rounded p-2 text-slate-700 dark:text-white",
                                    BUTTON_HOVER_CLASSES
                                  )}
                                  onClick={() => {
                                    set_is_category_dropdown_open(false);
                                    set_category_text(category_text.trim());
                                  }}
                                >
                                  <span>+</span>
                                  {` Create '${category_text.trim()}'`}
                                </li>
                              )}
                          </ul>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h-8" />
            <div className="flex justify-center gap-5">
              <RadixModal.Close asChild>
                <button
                  className={cn(
                    "h-[2rem] w-[4.5rem] rounded-full bg-slate-500 text-xs font-semibold text-white",
                    "hover:brightness-110 lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold"
                  )}
                  type="button"
                  // onClick={() => {
                  //   set_is_modal_open(false);
                  // }}
                >
                  Cancel
                </button>
              </RadixModal.Close>
              <button
                className={cn(
                  "flex w-[4.5rem] items-center justify-center rounded-full bg-squirtle text-xs font-semibold text-white dark:bg-rengar lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold",
                  is_create_expense_button_disabled
                    ? "opacity-50"
                    : "hover:cursor-pointer hover:brightness-110"
                )}
                type="submit"
                disabled={is_create_expense_button_disabled}
              >
                {create_expense_mtn.status !== "loading" && "Create"}
                {create_expense_mtn.status === "loading" && (
                  <Spinner className="h-4 w-4 border-2 border-solid border-white lg:h-5 lg:w-5" />
                )}
              </button>
            </div>
          </form>
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );
}
