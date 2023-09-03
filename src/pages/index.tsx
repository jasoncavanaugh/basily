import { GetServerSideProps, type NextPage } from "next";
import * as RadixModal from "@radix-ui/react-dialog";
import { Expense } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";

import * as RadixPopover from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { api } from "src/utils/api";
import Modal from "src/components/Modal";
import { BASE_COLORS, BaseColor } from "src/utils/colors";
import { ExpenseCategoryWithBaseColor } from "src/server/api/routers/router";
import Spinner from "src/components/Spinner";
import { ExpenseDataByDay, use_expenses } from "src/utils/useExpenses";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import { getServerAuthSession } from "src/server/auth";
import { cents_to_dollars_display } from "src/utils/centsToDollarDisplay";
import { ThemeButton } from "src/components/ThemeButton";
import { cn } from "src/utils/cn";
import { useTheme } from "next-themes";

//I should probably understand how this works, but I just ripped it from https://create.t3.gg/en/usage/next-auth
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
const Home: NextPage = () => {
  const session = useSession();
  const expense_data_query = use_expenses();

  if (session.status === "loading") {
    return (
      <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
        <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
        <button
          className="rounded-full bg-squirtle px-6 py-2 text-3xl font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 dark:bg-rengar"
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-charmander dark:bg-khazix">
      <div className="h-full bg-charmander dark:bg-khazix md:p-4">
        <div className="flex items-center justify-end gap-2 px-2 pt-2 md:pt-0 lg:gap-4">
          <ThemeButton />
          <button
            className="rounded-full bg-squirtle px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 dark:bg-rengar md:px-5 md:text-lg"
            onClick={() => void signOut()}
          >
            Log Out
          </button>
        </div>
        <div className="h-2 md:h-4" />
        <ul className="flex flex-col gap-4">
          {expense_data_query.status === "loading" && (
            <div className="flex h-[95vh] items-center justify-center">
              <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
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
            expense_data_query.data.expenses.length === 0 && (
              <div className="flex h-[95vh] items-center justify-center">
                <h1 className="text-white">
                  Click the '+' button to add a new expense.
                </h1>
              </div>
            )}
          {expense_data_query.status === "success" &&
            expense_data_query.data.expenses.length > 0 && (
              <ChronologicalExpenseList
                expenses_by_day={expense_data_query.data.expenses}
                category_id_to_color={
                  expense_data_query.data.category_id_to_color
                }
                category_id_to_name={
                  expense_data_query.data.category_id_to_name
                }
              />
            )}
        </ul>
        <AddNewExpenseButtonAndModal />
      </div>
    </div>
  );
};

export default Home;

function ChronologicalExpenseList({
  expenses_by_day,
  category_id_to_name,
  category_id_to_color,
}: {
  expenses_by_day: ExpenseDataByDay[];
  category_id_to_color: Map<string, BaseColor>;
  category_id_to_name: Map<string, string>;
}) {
  let output = [];
  for (const dwe of expenses_by_day) {
    output.push(
      <li key={dwe.id} className="px-3 py-4">
        <h1 className="inline rounded-lg bg-squirtle px-2 py-1 font-bold text-white dark:bg-rengar md:p-2">
          {dwe.date_display}
        </h1>
        <div className="h-4" />
        <ul className="flex flex-col gap-3 rounded-lg bg-pikachu p-4 shadow-sm dark:bg-leblanc dark:shadow-sm dark:shadow-leblanc">
          <ExpenseListForDay
            category_id_to_expenses_for_day={dwe.category_id_to_expenses}
            category_id_to_color={category_id_to_color}
            category_id_to_name={category_id_to_name}
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
  }
  return <>{output}</>;
}

function ExpenseListForDay({
  category_id_to_expenses_for_day,
  category_id_to_color,
  category_id_to_name,
}: {
  category_id_to_expenses_for_day: Map<string, Expense[]>;
  category_id_to_color: Map<string, BaseColor>;
  category_id_to_name: Map<string, string>;
}) {
  let output = [];
  for (const category_id of category_id_to_expenses_for_day.keys()) {
    const expense_list = category_id_to_expenses_for_day.get(category_id)!;
    const sum_of_expenses = expense_list.reduce((acc, e) => e.amount + acc, 0);
    const category_color = category_id_to_color.get(category_id)!;
    const category_name = category_id_to_name.get(category_id);
    output.push(
      <li key={category_id}>
        <div className="flex justify-between">
          <h2
            className={`flex items-center rounded-lg ${TW_COLORS_MP["bg"][category_color][200]} px-2 text-sm font-bold md:py-1 md:text-base ${TW_COLORS_MP["text"][category_color][700]}`}
          >
            {category_name}
          </h2>
          <p className="font-semibold text-squirtle dark:text-rengar">
            {cents_to_dollars_display(sum_of_expenses)}
          </p>
        </div>
        <ul className="flex flex-wrap gap-1 py-2">
          {expense_list.map((expense, i) => {
            return (
              <ExpenseButton
                expense={expense}
                category_color={category_color}
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
}: {
  expense: Expense;
  category_color: BaseColor;
}) {
  const [is_modal_open, set_is_modal_open] = useState(false);
  const expense_data_query = use_expenses();
  const api_utils = api.useContext();
  const delete_expense = api.router.delete_expense.useMutation({
    onSuccess: () => {
      expense_data_query.invalidate_queries();
      set_is_modal_open(false); //TODO: Have to figure out how to close the modal once the new data comes in
    },
    onError: () => {
      alert("error");
    },
  });
  return (
    <Modal
      open={is_modal_open}
      trigger={
        <li
          key={expense.id}
          className={`rounded-full ${TW_COLORS_MP["bg"][category_color][500]} px-2 text-white hover:cursor-pointer`}
          onClick={() => set_is_modal_open(true)}
        >
          {cents_to_dollars_display(expense.amount)}
        </li>
      }
      className={cn(
        "fixed left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded bg-pikachu dark:bg-leblanc",
        "border-t-8 border-t-red-500 px-5 py-3 md:rounded-lg lg:top-1/2 lg:w-[30rem] lg:px-8 lg:py-6"
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          delete_expense.mutate({ id: expense.id });
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
            className={cn("flex w-[4.5rem] items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold")}
            type="submit"
          >
            {delete_expense.status === "loading" && (
              <Spinner className="h-4 w-4 border-2 border-solid border-white lg:h-5 lg:w-5" />
            )}
            {delete_expense.status !== "loading" && "Delete"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const AMOUNT_REGEX = new RegExp(/^\d*(\.\d\d)?$/);
function is_valid_amount(amount: string) {
  const is_zero_amount =
    amount.split("").filter((c) => c !== "." && c !== "0").length === 0;
  return AMOUNT_REGEX.test(amount) && !is_zero_amount;
}
const DATE_REGEX = new RegExp(
  /^(0?[1-9]|1[012])[/](0?[1-9]|[12][0-9]|3[01])[/](19|20)\d\d$/
);
function is_valid_date(date_str: string) {
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
function get_today() {
  return `${
    new Date().getMonth() + 1
  }/${new Date().getDate()}/${new Date().getFullYear()}`;
}

const CATEGORY_SELECTION_HOVER_CLASSES =
  "hover:bg-squirtle_light hover:cursor-pointer hover:bg-opacity-20";
function AddNewExpenseButtonAndModal() {
  const [amount, set_amount] = useState("");
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [category_text, set_category_text] = useState("");
  const [is_dropdown_open, set_is_dropdown_open] = useState(true);
  const [color, set_color] = useState<BaseColor>("pink");
  const [
    is_category_color_selection_disabled,
    set_is_category_color_selection_disabled,
  ] = useState(false);

  const [date, set_date] = useState(get_today());

  const api_utils = api.useContext();
  const expense_data_query = use_expenses();
  const expense_categories_query = api.router.get_categories.useQuery();

  const create_expense = api.router.create_expense.useMutation({
    onSuccess: () => {
      set_is_modal_open(false);
      expense_data_query.invalidate_queries();
    },
    onError: (err, data, ctx) => {
      console.log(err, data);
      alert("error");
    },
  });
  const create_category_and_expense = api.router.create_category.useMutation({
    onSuccess: (data, variables, context) => {
      create_expense.mutate({
        category_id: data.id,
        amount: amount,
        date: extract_date_fields(date),
      });
    },
    onError: (err, data, ctx) => {
      alert("error in create_caegory_and_expense");
    },
  });

  function handle_create_expense(
    expense_categories: ExpenseCategoryWithBaseColor[]
  ) {
    const does_category_exist =
      expense_categories.filter((exp) => exp.name === category_text).length > 0;
    if (!does_category_exist) {
      create_category_and_expense.mutate({
        name: category_text,
        color: color,
      });
    } else {
      const id = expense_categories.find((c) => c.name === category_text)?.id;
      console.log("id", id, "amount", amount);
      if (!id) throw new Error("id undefined");
      create_expense.mutate({
        category_id: id,
        amount: amount,
        date: extract_date_fields(date),
      });
    }
  }
  if (expense_categories_query.status === "error") {
    console.error(expense_categories_query.error);
  }

  const is_create_expense_button_disabled =
    category_text.length === 0 ||
    color.length === 0 ||
    amount.length === 0 ||
    !is_valid_amount(amount) ||
    !is_valid_date(date) ||
    is_dropdown_open; //This is because if the dropdown is still open, that indicates that the user hasn't selected something yet

  const does_category_exist =
    expense_categories_query.data?.filter((cat) => cat.name === category_text)
      .length !== 0;

  return (
    <Modal
      open={is_modal_open}
      on_open_change={() => {
        set_amount("");
        set_category_text("");
        set_date(get_today());
        set_is_dropdown_open(false);
        set_is_category_color_selection_disabled(false);
        set_color("pink");
      }}
      className={cn(
        "fixed left-1/2 top-0 w-full -translate-x-1/2 rounded border-t-8 border-t-squirtle bg-pikachu dark:border-t-rengar dark:bg-leblanc",
        "p-4 md:top-1/2 md:w-[40rem] md:-translate-y-1/2 md:rounded-lg lg:p-8"
      )}
      // className={cn("fixed flex border-t-squirtle dark:border-t-rengar dark:bg-leblanc left-1/2 top-1/3 flex w-[30rem] -translate-x-1/2 -translate-y-1/2",
      //   "bg-pikachu flex-col border-t-8 px-5 py-3",
      //   "lg:top-1/2 lg:px-8 lg:py-6")}
      trigger={
        <button
          type="button"
          className={cn(
            "fixed bottom-5 right-5 h-12 w-12 rounded-full bg-squirtle p-0 shadow shadow-blue-300 hover:cursor-pointer dark:bg-rengar",
            "md:bottom-14 md:right-14 md:h-14 md:w-14",
            "lg:shadow-md lg:shadow-blue-300 lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-lg lg:hover:shadow-blue-300 lg:hover:brightness-110"
          )}
          disabled={
            expense_categories_query.status === "loading" ||
            expense_categories_query.status === "error"
          }
          onClick={() => set_is_modal_open(true)}
        >
          {/* https://tailwindcomponents.com/component/tailwind-css-fab-buttons */}
          <svg
            viewBox="0 0 20 20"
            enableBackground="new 0 0 20 20"
            className="inline-block h-6 w-6"
          >
            <path
              fill="#FFFFFF"
              d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601 C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399 C15.952,9,16,9.447,16,10z"
            />
          </svg>
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handle_create_expense(expense_categories_query.data!);
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
              set_is_category_color_selection_disabled(false);
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
          <div className="h-2" />
          <div className="flex items-center gap-3">
            <CategoryColorSelection
              disabled={is_category_color_selection_disabled}
              on_select_color={(color) => set_color(color)}
              cur_color={color}
            />
            <div className="w-full">
              <input
                name="category"
                value={category_text}
                onChange={(e) => {
                  set_category_text(e.target.value);
                  set_is_dropdown_open(true);
                  set_is_category_color_selection_disabled(false);
                }}
                className="w-full grow rounded border border-slate-400 px-2 py-1 focus:outline-slate-400"
                autoComplete="off"
                type="text"
              ></input>
              <div className="relative m-0 h-0 p-0">
                {category_text.length > 0 && is_dropdown_open && (
                  <ul className="absolute z-20 flex max-h-[200px] w-full flex-col gap-2 overflow-y-scroll rounded border bg-white p-3 dark:bg-shaco">
                    {expense_categories_query.data
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
                              CATEGORY_SELECTION_HOVER_CLASSES
                            )}
                            onClick={() => {
                              set_category_text(exp.name);
                              set_color(exp.color);
                              set_is_dropdown_open(false);
                              set_is_category_color_selection_disabled(true);
                            }}
                          >
                            <div
                              className={`${
                                TW_COLORS_MP["bg"][exp.color][500]
                              } h-4 w-4 rounded-full`}
                            />
                            <p className="">{exp.name}</p>
                          </li>
                        );
                      })}
                    {!does_category_exist && category_text.length > 0 && (
                      <li
                        className={cn(
                          "rounded p-2",
                          CATEGORY_SELECTION_HOVER_CLASSES
                        )}
                        onClick={() => set_is_dropdown_open(false)}
                      >
                        <span>+</span>
                        {` Create '${category_text.trim()}'`}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-8" />
        <div className="flex justify-center gap-5">
          <button
            className="h-[2rem] w-[4.5rem] rounded-full bg-slate-500 text-xs font-semibold text-white hover:brightness-110 lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold"
            type="button"
            onClick={() => {
              set_is_modal_open(false);
            }}
          >
            Cancel
          </button>
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
            {create_expense.status !== "loading" && "Create"}
            {create_expense.status === "loading" && (
              <Spinner className="h-4 w-4 border-2 border-solid border-white lg:h-5 lg:w-5" />
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function CategoryColorSelection({
  on_select_color,
  cur_color,
  disabled,
}: {
  on_select_color: (color: BaseColor) => void;
  cur_color: BaseColor | "";
  disabled: boolean;
}) {
  const [is_open, set_is_open] = useState(false);
  return (
    <RadixPopover.Root
      open={is_open}
      onOpenChange={(open) => {
        disabled ? set_is_open(false) : set_is_open(open);
      }}
    >
      <RadixPopover.Trigger asChild>
        <button
          className={cn(
            "h-4 w-4 shrink-0 rounded-full md:h-6 md:w-6",
            cur_color !== ""
              ? TW_COLORS_MP["bg"][cur_color][500]
              : TW_COLORS_MP["bg"]["pink"][500],
            disabled
              ? "hover:cursor-not-allowed"
              : "hover:cursor-pointer hover:brightness-110"
          )}
        ></button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="left"
          className={cn(
            "z-30 flex flex-wrap rounded-lg bg-bulbasaur p-3 shadow-md dark:bg-shaco",
            "md:h-[200px] md:w-[150px] md:flex-col md:gap-1"
          )}
          sideOffset={5}
        >
          {BASE_COLORS.map((option) => {
            return (
              <div
                key={option}
                onClick={() => on_select_color(option)}
                className={`${
                  TW_COLORS_MP["bg"][option][500]
                } h-4 w-4 rounded-full border-2 ${
                  cur_color === option
                    ? "border-slate-900 brightness-110"
                    : "border-white hover:cursor-pointer hover:border-slate-900 hover:brightness-110"
                } md:h-6 md:w-6`}
              />
            );
          })}
          <RadixPopover.Close
            className="PopoverClose"
            aria-label="Close"
          ></RadixPopover.Close>
          <RadixPopover.Arrow className="fill-slate-300" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
