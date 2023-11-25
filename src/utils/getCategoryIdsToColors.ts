import { ExpenseCategoryWithBaseColor } from "src/server/api/routers/router";
import { BaseColor } from "./colors";

export function get_category_ids_to_colors(
  expense_categories: ExpenseCategoryWithBaseColor[]
) {
  const category_id_to_color = new Map<string, BaseColor>();
  for (const cat of expense_categories) {
    if (!category_id_to_color.has(cat.id)) {
      category_id_to_color.set(cat.id, cat.color);
    }
  }
  return category_id_to_color;
}
