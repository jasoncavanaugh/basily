import { Expense } from "@prisma/client";
import * as RadixModal from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Modal from "src/components/Modal";
import { Spinner } from "src/components/Spinner";
import { api } from "src/utils/api";
import { cents_to_dollars_display } from "src/utils/centsToDollarDisplay";
import { cn } from "src/utils/cn";
import { BaseColor } from "src/utils/colors";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import { ExpenseDataByDay, use_expenses } from "src/utils/useExpenses";
import { SignIn } from "./sign-in";
import { NextPage } from "next";

export default function Expenses() {
  const session = useSession();
  const expense_data_query = use_expenses();
  const router = useRouter();

  if (session.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
        <Spinner className="h-16 w-16 border-4 border-solid border-pikachu dark:border-rengar dark:border-rengar_light lg:border-8" />
      </div>
    );
  }
  if (session.status === "unauthenticated") {
    return <SignIn />;
  }
  return (
    <ul className="flex flex-col gap-4">
      {expense_data_query.status === "loading" && (
        <div className="flex h-[95vh] items-center justify-center">
          <Spinner className="h-16 w-16 border-4 border-solid border-pikachu dark:border-rengar dark:border-rengar_light lg:border-8" />
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
            category_id_to_color={expense_data_query.data.category_id_to_color}
            category_id_to_name={expense_data_query.data.category_id_to_name}
          />
        )}
    </ul>
  );
}

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
            className={cn(
              "flex w-[4.5rem] items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold"
            )}
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
