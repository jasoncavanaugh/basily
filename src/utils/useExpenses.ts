import { Day, Expense } from "@prisma/client";

import { api } from "./api";
import { get_category_ids_to_colors } from "./getCategoryIdsToColors";
import { get_category_ids_to_names } from "./getCategoryIdsToNames";
import { subYears } from "date-fns";
import { create } from "zustand";
import {
  DayWithExpenses,
  GetExpensesOverDateRangeRet,
} from "src/server/api/routers/router";
import { useEffect } from "react";

export type DMY = {
  day: number;
  month_idx: number;
  year: number;
};
type ExpensesStoreState = {
  expenses_qry_res: GetExpensesOverDateRangeRet;
  set_expenses_qry_res: (new_res: GetExpensesOverDateRangeRet) => void;
  from_date: DMY;
  set_from_date: (new_from: DMY) => void;
  to_date: DMY;
  set_to_date: (new_to: DMY) => void;
};
const use_expenses_store = create<ExpensesStoreState>((set) => {
  const year_ago = subYears(new Date(), 1);
  const today_date = new Date();
  return {
    expenses_qry_res: {
      days: [],
      expense_categories: [],
    },
    set_expenses_qry_res: (new_res: GetExpensesOverDateRangeRet) =>
      set((prev_state) => ({ ...prev_state, expenses_qry_res: new_res })),
    from_date: {
      day: year_ago.getDate(),
      month_idx: year_ago.getMonth(),
      year: year_ago.getFullYear(),
    },
    set_from_date: (new_from_date: DMY) =>
      set((prev_state) => ({ ...prev_state, from_date: new_from_date })),
    to_date: {
      day: today_date.getDate(),
      month_idx: today_date.getMonth(),
      year: today_date.getFullYear(),
    },
    set_to_date: (new_to_date: DMY) =>
      set((prev_state) => ({ ...prev_state, to_date: new_to_date })),
  };
});

function compare_dmy(
  first: DMY,
  operation: "is before" | "is equal",
  second: DMY
) {
  if (operation === "is before") {
    const is_year_before = first.year < second.year;
    if (is_year_before) {
      return true;
    }
    const is_year_same_and_month_before =
      first.year === second.year && first.month_idx < second.month_idx;
    if (is_year_same_and_month_before) {
      return true;
    }
    const is_year_same_month_same_day_before =
      first.year === second.year &&
      first.month_idx === second.month_idx &&
      first.day < second.day;
    if (is_year_same_month_same_day_before) {
      return true;
    }
    return false;
  } else if (operation === "is equal") {
    return (
      first.year === second.year &&
      first.month_idx === second.month_idx &&
      first.day === second.day
    );
  }
}

export function use_jason(date_picker_dates: { from_date?: DMY; to_date?: DMY } | undefined) {
  const expenses_store = use_expenses_store();
  const api_utils = api.useContext();

  let api_from_date = expenses_store.from_date;
  let api_to_date = expenses_store.to_date;
  if (date_picker_dates && date_picker_dates.from_date && date_picker_dates.to_date) {
    api_from_date = compare_dmy(
      date_picker_dates.from_date,
      "is before",
      expenses_store.from_date
    )
      ? date_picker_dates.from_date
      : expenses_store.from_date;

    api_to_date = compare_dmy(
      expenses_store.to_date,
      "is before",
      date_picker_dates.to_date
    )
      ? date_picker_dates.to_date
      : expenses_store.to_date;
  }

  const expenses_qry = api.router.get_expenses_over_date_range.useQuery({
    from_date: api_from_date,
    to_date: api_to_date,
  });

  useEffect(() => {
    if (expenses_qry.data) {
      expenses_store.set_expenses_qry_res(expenses_qry.data);
    }
  }, [expenses_qry.data]);

  if (expenses_qry.status === "loading") {
    return { 
      status: "loading", 
      error: undefined, 
      data: undefined, 
      invalidate: () => {}
    } as const;
  }
  if (expenses_qry.status === "error") {
    return {
      status: "error",
      error: expenses_qry.error,
      data: undefined,
      invalidate: () => {}
    } as const;
  }
  //Update dates in store if needed
  if (compare_dmy(api_from_date, "is before", expenses_store.from_date)) {
    expenses_store.set_from_date(api_from_date);
  }
  if (compare_dmy(expenses_store.to_date, "is before", api_to_date)) {
    expenses_store.set_to_date(api_to_date);
  }

  expenses_store.expenses_qry_res.days.sort((a, b) => {
    //Reverse sort
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    if (a.month !== b.month) {
      return b.month - a.month;
    }
    if (a.day !== b.day) {
      return b.day - a.day;
    }
    return 0;
  });
  return {
    status: "success",
    error: undefined,
    data: expenses_store.expenses_qry_res,
    invalidate: () => {
      api_utils.router.get_expenses_over_date_range.invalidate();
      // expenses_qry.refetch();
    }
  } as const;
}

export type ExpenseDataByDay = {
  id: string;
  total_for_day: number;
  date_display: `${number}-${number}-${number}`;
  category_id_to_expenses: Map<string, Expense[]>;
};

export function use_expenses() {
  const expense_categories_query = api.router.get_categories.useQuery();
  // const expense_categories_query = getExpenseCategories();
  const api_utils = api.useContext();

  const expenses_by_days_query =
    api.router.get_expenses_paginated_by_days.useQuery({ page: 0 });
  // const expenses_by_days_query = getExpensesByDays();

  /*
  const expense_data_query = api.router.get_expenses_over_date_range.useQuery({
    from_date: {
      day: year_ago.getDate(),
      month_idx: year_ago.getMonth(),
      year: year_ago.getFullYear(),
    },
    to_date: {
      day: today_date.getDate(),
      month_idx: today_date.getMonth(),
      year: today_date.getFullYear(),
    },
  });
*/

  // const expenses_by_days_query = getExpensesByDays();

  if (
    expense_categories_query.status === "loading" ||
    expenses_by_days_query.status === "loading"
  ) {
    return {
      status: "loading",
      error: undefined,
      data: undefined,
      invalidate_queries: () => {},
    } as const;
  }

  if (
    expense_categories_query.status === "error" ||
    expenses_by_days_query.status === "error"
  ) {
    return {
      status: "error",
      error: expense_categories_query.error || expenses_by_days_query.error,
      data: undefined,
      invalidate_queries: () => {},
    } as const;
  }

  console.log("expenses_by_days_query", expenses_by_days_query.data);

  const expense_categories = expense_categories_query.data;

  const category_id_to_name = get_category_ids_to_names(expense_categories);
  const category_id_to_color = get_category_ids_to_colors(expense_categories);

  /*
   * [{ date: string, id_to_expenses: { id: expenses }], id_to_name: { id: name }, id_to_color: { id: color } }
   *
   */

  const days_with_expenses = expenses_by_days_query.data.sort((a, b) => {
    //Reverse sort
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    if (a.month !== b.month) {
      return b.month - a.month;
    }
    if (a.day !== b.day) {
      return b.day - a.day;
    }
    return 0;
  });
  let processed_expense_data: ExpenseDataByDay[] = [];
  for (const dwe of days_with_expenses) {
    const category_id_to_expenses = new Map<string, Expense[]>();
    const expenses_for_day = dwe.expenses;
    let total_expenses_for_day = 0;
    for (const ex of expenses_for_day) {
      if (!category_id_to_expenses.has(ex.category_id)) {
        category_id_to_expenses.set(ex.category_id, []);
      }
      category_id_to_expenses.get(ex.category_id)!.push(ex);
      total_expenses_for_day += ex.amount;
    }
    processed_expense_data.push({
      id: dwe.id,
      total_for_day: total_expenses_for_day,
      date_display: `${dwe.month + 1}-${dwe.day}-${dwe.year}`,
      category_id_to_expenses,
    });
  }

  return {
    status: "success",
    error: undefined,
    data: {
      expenses: processed_expense_data,
      category_id_to_name,
      category_id_to_color,
    },
    invalidate_queries: () => {
      api_utils.router.get_categories.invalidate();
      api_utils.router.get_expenses_paginated_by_days.invalidate({ page: 0 });
    },
  } as const;
}

export function process_days_with_expenses({ days }: { days: DayWithExpenses[] }) {
  const days_with_expenses = days.sort((a, b) => {
    //Reverse sort
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    if (a.month !== b.month) {
      return b.month - a.month;
    }
    if (a.day !== b.day) {
      return b.day - a.day;
    }
    return 0;
  });

  let processed_expense_data: ExpenseDataByDay[] = [];
  for (const dwe of days_with_expenses) {
    const category_id_to_expenses = new Map<string, Expense[]>();
    const expenses_for_day = dwe.expenses;
    let total_expenses_for_day = 0;
    for (const ex of expenses_for_day) {
      if (!category_id_to_expenses.has(ex.category_id)) {
        category_id_to_expenses.set(ex.category_id, []);
      }
      category_id_to_expenses.get(ex.category_id)!.push(ex);
      total_expenses_for_day += ex.amount;
    }
    processed_expense_data.push({
      id: dwe.id,
      total_for_day: total_expenses_for_day,
      date_display: `${dwe.month + 1}-${dwe.day}-${dwe.year}`,
      category_id_to_expenses,
    });
  }
  return processed_expense_data;
}
