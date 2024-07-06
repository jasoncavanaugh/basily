import { PenSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "src/components/Spinner";
import { ProfileNav } from "src/components/ProfileNav";
import { ExpenseCategoryWithBaseColor } from "src/server/api/routers/router";
import { api } from "src/utils/api";
import { cn } from "src/utils/cn";
import { BASE_COLORS, BaseColor } from "src/utils/colors";
import { SPINNER_CLASSES } from "src/utils/constants";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";

export default function ManageCategories() {
  const categories_qry = api.router.get_categories.useQuery();
  const a = categories_qry.data;

  return (
    <div className=" bg-charmander p-4 dark:bg-khazix">
      <div className="flex justify-end pr-2">
        <ProfileNav to_categories={false} />
      </div>
      {categories_qry.status === "loading" && (
        <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
          <Spinner className={SPINNER_CLASSES} />
        </div>
      )}
      {categories_qry.status === "error" && (
        <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
          An error occurred...
        </div>
      )}
      {categories_qry.status === "success" &&
        categories_qry.data.length > 0 && (
          <ManageCategoriesDisplay
            categories={categories_qry.data.sort((a, b) =>
              a.name < b.name ? -1 : 1
            )}
          />
        )}
    </div>
  );
}

function ManageCategoriesDisplay({
  categories,
}: {
  categories: Array<ExpenseCategoryWithBaseColor>;
}) {
  if (categories.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-charmander p-1 italic dark:bg-khazix md:p-4">
        No categories to display
      </div>
    );
  }
  const [selected_category_idx, set_selected_category_idx] = useState(
    categories.at(0)!.id
  );
  const selected_cat = categories.find((c) => c.id === selected_category_idx);
  if (!selected_cat) {
    //Should never happen
    throw new Error("How did this happen??");
  }

  const [edited_category_text, set_edited_category_text] = useState(
    selected_cat.name
  );
  const [edited_category_color, set_edited_category_color] =
    useState<BaseColor>(selected_cat.color);
  useEffect(() => {
    set_edited_category_text(selected_cat.name);
    set_edited_category_color(selected_cat.color);
  }, [selected_category_idx]);
  const api_ctx = api.useContext();
  const edit_category_mtn = api.router.edit_category.useMutation({
    onSuccess: () => {
      api_ctx.router.get_categories.invalidate();
      //   set_selected_category_idx(0);
    },
  });

  const does_category_exist = categories.find((c, i) => {
    return (
      c.name === edited_category_text.trim() && c.id !== selected_category_idx
    );
  });
  const is_category_empty = edited_category_text.length === 0;
  const is_category_text_valid = !is_category_empty && !does_category_exist;
  const has_changes =
    selected_cat.name !== edited_category_text.trim() ||
    selected_cat.color !== edited_category_color;
  const is_create_expense_button_disabled =
    !has_changes || !is_category_text_valid;
  return (
    <div className="flex h-[85vh] flex-col flex-col-reverse justify-end md:flex-row md:justify-center md:gap-4">
      <div className="h-[70%] overflow-scroll md:h-[100%] md:w-[15%]">
        <ul className="mr-2 flex flex-col gap-2 md:mr-4">
          {categories.map((cate, i) => {
            return (
              <li key={cate.id}>
                <button
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border p-2 dark:border-none",
                    cate.id === selected_category_idx
                      ? "bg-pikachu dark:bg-leblanc"
                      : "hover:cursor-pointer hover:bg-pikachu hover:opacity-80 hover:dark:bg-leblanc"
                  )}
                  onClick={() => {
                    if (cate.id !== selected_category_idx) {
                      set_selected_category_idx(cate.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full",
                      TW_COLORS_MP["bg"][cate.color]["500"]
                    )}
                  />
                  <p>{cate.name}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="h-[30%]">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!is_create_expense_button_disabled) {
              edit_category_mtn.mutate({
                id: selected_cat.id,
                new_name: edited_category_text,
                new_color: edited_category_color,
              });
            }
          }}
        >
          <div>
            <input
              type="text"
              className={cn(
                "w-full border-none bg-charmander text-3xl font-bold text-cyan-900 dark:bg-khazix dark:text-white",
                "focus:outline-none"
              )}
              value={edited_category_text}
              onChange={(e) => set_edited_category_text(e.target.value)}
            ></input>
            <p className="h-6 text-xs italic text-red-500 dark:text-red-600">
              {does_category_exist
                ? "Category already exists"
                : is_category_empty
                ? "Category name must not be empty"
                : ""}
            </p>
          </div>
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
                    set_edited_category_color(option);
                  }}
                  className={cn(
                    TW_COLORS_MP["bg"][option][500],
                    "h-5 w-5 rounded-full border-2",
                    "border-pikachu focus:border-black focus:outline-none dark:border-leblanc dark:focus:border-white",
                    option === edited_category_color
                      ? "border-slate-900 brightness-110 hover:cursor-default dark:border-white"
                      : "hover:cursor-pointer  hover:border-slate-900 hover:brightness-110 dark:hover:border-white",
                    "md:h-7 md:w-7"
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={cn(
                "flex items-center justify-center rounded-lg bg-squirtle text-xs text-white",
                "h-[2rem] w-[8rem]",
                "dark:bg-rengar lg:h-[3rem] lg:w-[8.5rem] lg:text-base",
                is_create_expense_button_disabled
                  ? "opacity-50"
                  : "hover:cursor-pointer hover:brightness-110"
              )}
              disabled={is_create_expense_button_disabled}
            >
              {edit_category_mtn.status !== "loading" && "Save Changes"}
              {edit_category_mtn.status === "loading" && (
                <Spinner className="h-4 w-4 border-2 border-solid border-white lg:h-5 lg:w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
