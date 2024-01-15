import { Day, Expense } from "@prisma/client";

import { api } from "./api";
import { get_category_ids_to_colors } from "./getCategoryIdsToColors";
import { get_category_ids_to_names } from "./getCategoryIdsToNames";

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
