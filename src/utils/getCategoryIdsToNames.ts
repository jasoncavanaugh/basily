import { ExpenseCategoryWithBaseColor } from "src/server/api/routers/router";

export function get_category_ids_to_names(expense_categories: ExpenseCategoryWithBaseColor[]) {
  const category_id_to_name = new Map<string, string>();
  for (const cat of expense_categories) {
    if (!category_id_to_name.has(cat.id)) {
      category_id_to_name.set(cat.id, cat.name);
    }
  }
  return category_id_to_name;
}
