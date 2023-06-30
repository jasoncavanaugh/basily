import { Expense } from "@prisma/client";
import { api } from "./api";
import { BaseColor } from "./colors";

export function use_expenses() {
  const today_date = new Date();
  const day = today_date.getDate();
  const month = today_date.getMonth() + 1;
  const year = today_date.getFullYear();

  const expense_categories_query =
    api.router.get_categories_without_expenses.useQuery();

  console.log("YEAR", year);
  const expenses_query = api.router.get_expenses.useQuery({
    from_date: {
      day: day - 14,
      month: month,
      year: year,
    },
    to_date: {
      day: day + 1,
      month: month,
      year: year,
    },
  });
  
  const date_to_category_to_expenses = new Map<string, Map<string, Expense[]>>();
  if (expenses_query.status === "loading" || expense_categories_query.status === "loading") {
    return { status: "loading", error: undefined, data: undefined };
  }
  if (expenses_query.status === "error") {
    return { status: "error", error: expenses_query.error, data: undefined };
  }
  if (expense_categories_query.status === "error") {
    return { status: "error", error: expense_categories_query.error, data: undefined };
  }
  //Within each date, group expenses into the same category
  const expense_categories = expense_categories_query.data;

  const category_id_to_name = new Map<string, string>();
  for (const cat of expense_categories) {
    if (!category_id_to_name.has(cat.id)) {
      category_id_to_name.set(cat.id, cat.name);
    }
  }
  const category_id_to_color = new Map<string, BaseColor>();
  for (const cat of expense_categories) {
    if (!category_id_to_color.has(cat.id)) {
      category_id_to_color.set(cat.id, cat.color);
    }
  }
  
  // { date: { expense_category_name: expense[] }}
  const expenses = expenses_query.data;
  let dates: string[] = [];
  for (const ex of expenses) {
    const date_key = `${ex.createdAt.getFullYear()}-${
      ex.createdAt.getMonth() + 1
    }-${ex.createdAt.getDate()}`;
    if (dates.length === 0 || dates[dates.length - 1] !== date_key) {
      dates.push(date_key);
    }
    if (!date_to_category_to_expenses.has(date_key)) {
      date_to_category_to_expenses.set(date_key, new Map<string, Expense[]>());
    }
    const category_name = category_id_to_name.get(ex.category_id)!
    if (!date_to_category_to_expenses.get(date_key)!.has(category_name)) {
      date_to_category_to_expenses.get(date_key)!.set(category_name, []);
    }
    date_to_category_to_expenses.get(date_key)!.get(category_name)!.push(ex);
  }

  return { status: "success", error: undefined, data: { dates, date_to_category_to_expenses, category_id_to_name, category_id_to_color } };
}
