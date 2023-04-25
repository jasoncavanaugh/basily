import { type NextPage } from "next";
import * as RadixModal from "@radix-ui/react-dialog";
import { Expense, ExpenseCategory } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { useState } from "react";
import { api } from "src/utils/api";
import Spinner from "src/components/Spinner";
import Modal from "src/components/Modal";
import { COLOR_OPTIONS, ColorOption } from "src/utils/colors";

const Home: NextPage = () => {
  const session = useSession();
  const expense_categories = api.expense.get_all_categories.useQuery();

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
          className="rounded-full bg-togglPeach px-6 py-2 text-3xl font-semibold text-white shadow-sm shadow-red-300 hover:brightness-110"
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      </div>
    );
  }

  const s = expense_categories.data;

  return (
    <div className="p-1 md:p-4">
      <div className="flex flex-col-reverse items-end justify-end gap-2 px-1 pt-2 md:flex-row md:pt-0">
        <button
          className="rounded-full bg-togglPeach px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-red-300 hover:brightness-110 md:px-5 md:text-lg"
          onClick={() => void signOut()}
        >
          Log Out
        </button>
      </div>
      <div className="h-2 md:h-4" />
      <ul className="flex flex-col gap-4">
        {expense_categories.status === "loading" && (
          <div className="flex h-[95vh] items-center justify-center">
            <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
          </div>
        )}
        {expense_categories.status === "error" && (
          <div className="flex h-[95vh] items-center justify-center">
            <h1 className="text-white">
              Uh oh, there was a problem loading your expenses.
            </h1>
          </div>
        )}
        {expense_categories.status === "success" && expense_categories.data.length === 0 && (
          <div className="flex h-[95vh] items-center justify-center">
            <h1 className="text-white">
              Click the '+' button to add a new expense.
            </h1>
          </div>
        )}
        {expense_categories.status === "success" &&
          expense_categories.data.length > 0 &&
          <ExpenseList expense_categories={expense_categories.data} />
        }
      </ul>
      {expense_categories.status === "success" && <AddNewExpenseButtonAndModal expense_categories={expense_categories.data}/>}
    </div>
  );
};

export default Home;

interface ExpenseListProps {
  expense_categories: (ExpenseCategory & { expenses: Expense[] })[]
}
function ExpenseList({ expense_categories }: ExpenseListProps) {
  const m = new Map<Date, Expense[]>();
  const dates = [];
  const s = new Map<string, string>();
  for (let i = 0; i < expense_categories.length; i++) {
    const category = expense_categories[i]!;
    s.set(category.id, category.name);
  }

  for (let i = 0; i < expense_categories.length; i++) {
    const category = expense_categories[i]!;
    for (let j = 0; j < category.expenses.length; j++) {
      const exp = category.expenses[j]!;
      if (!m.has(exp.createdAt)) {
        m.set(exp.createdAt, []);
        dates.push(exp.createdAt);
      }
      m.get(exp.createdAt)!.push(exp);
    }
  }
  dates.sort().reverse();
  const output = [];
  for (const d of dates) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate() + 1;
    output.push(
      <li key={d.toLocaleString()} className="">
        <h1>{`${month}/${day}/${year}`}</h1>
        <ul>
          {m.get(d)!.map((exp) => {
            return (
              <li key={exp.id}>
                {s.get(exp.id)}
                {exp.amount.toString()}
              </li>
            );
          })}
        </ul>
      </li>
    );
  }
  return <>{output}</>;
}

function AddNewExpenseButtonAndModal({ expense_categories }: ExpenseListProps) {
  const [name, set_name] = useState("");
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [category_text, set_category_text] = useState("");
  const [is_dropdown_open, set_is_dropdown_open] = useState(false);

  const api_utils = api.useContext();
  const create_category = api.expense.create_category.useMutation({
    onSuccess: () => {
      api_utils.expense.get_all_categories.invalidate();
      set_is_modal_open(false); //TODO: Have to figure out how to close the modal once the new data comes in
    },
    onError: (err, data, ctx) => {
      alert("error");
    },
  });

  const create_expense = api.expense.create.useMutation({
    onSuccess: () => {
      api_utils.expense.get_all_categories.invalidate();
      set_is_modal_open(false); //TODO: Have to figure out how to close the modal once the new data comes in
    },
    onError: (err, data, ctx) => {
      alert("error");
    },
  }
  );


  return (
    <Modal
      open={is_modal_open}
      className="top-1/3 left-1/2 flex w-[30rem] -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-togglPeach px-5 py-3 lg:top-1/2 lg:top-1/2 lg:px-8 lg:py-6"
      trigger={
        <button
          type="button"
          className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-togglPeach text-3xl font-bold text-white md:bottom-16 md:right-16 lg:shadow-md lg:shadow-red-300 lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-red-300 lg:hover:brightness-110"
          onClick={() => set_is_modal_open(true)}
        >
          +
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <RadixModal.Title className="whitespace-nowrap text-3xl font-bold text-slate-700">
          Add Expense
        </RadixModal.Title>
        <div className="h-1 lg:h-4" />
        <div className="flex w-full flex-col gap-2">
          <label htmlFor="habit-name" >Amount:</label>
          <input
            name="habit-name"
            onChange={(e) => set_name(e.target.value)}
            className="rounded border border-slate-600 px-2 py-1 border-slate-600 focus:outline-slate-400"
            autoComplete="off"
            type="text"
          ></input>
          <label htmlFor="habit-name" >Category:</label>
          <input
            name="habit-name"
            onChange={(e) => { set_category_text(e.target.value); set_is_dropdown_open(true); }}
            className="rounded border border-slate-600 px-2 py-1 border-slate-600 focus:outline-slate-400"
            autoComplete="off"
            type="text"
          ></input>
          <div className="relative h-0 p-0 m-0">
            {category_text.length > 0 && is_dropdown_open &&
              <ul className="absolute border w-full flex flex-col p-3 gap-2 bg-white z-20 max-h-[200px] overflow-y-scroll border rounded">
                {expense_categories.filter((exp) => exp.name.includes(category_text) || category_text.includes(exp.name)).map((exp) => {
                  return (
                    <li
                      key={exp.id}
                      className="flex gap-3 items-center border border-purple-300 py-2 px-3 rounded hover:cursor-pointer hover:bg-purple-100"
                      onClick={() => set_category_text(exp.name)}
                    >
                      <div className={`w-4 h-4 rounded-full bg-red`} />
                      <p className="">{exp.name}</p>
                    </li>
                  );
                })}
                <li
                  onClick={() => set_is_dropdown_open(false)}
                ><span>+</span>{` Create '${category_text}'`}</li>
              </ul>
            }
          </div>

        </div>
        <div className="h-8" />
        <div className="flex justify-center gap-5">
          <button
            className="rounded-full bg-togglBtnGray px-3 py-2 text-xs font-semibold text-white hover:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
            onClick={() => {
              set_is_modal_open(false);
            }}
          >
            Cancel
          </button>
          <button
            className={`rounded-full bg-togglPink px-3 py-2 text-xs font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold ${true
              ? "opacity-50"
              : "hover:cursor-pointer hover:brightness-110"
              }`}
            type="submit"
            onClick={() => {
              if (!is_dropdown_open) {
              } else {
              }
            }}
          >
            Create
            {/*
            {create_habit.status === "loading" && (
              <Spinner className="mx-[2.1rem] h-4 w-4 border-2 border-solid border-white lg:mx-[3.1rem] lg:my-1" />
            )}

            {create_habit.status !== "loading" && "Create Habit"}
            */}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function ColorSelection(props: {
  on_select_color: (option: ColorOption) => void;
  selected_color: ColorOption | "";
}) {
  return (
    <>
      {COLOR_OPTIONS.map((option) => {
        return (
          <div
            key={option}
            className={`bg-${option} h-6 w-6 rounded-md border-2 ${props.selected_color === option
              ? "border-slate-900 brightness-110"
              : "border-white hover:cursor-pointer hover:border-slate-900 hover:brightness-110"
              } lg:h-8 lg:w-8`}
            onClick={() => props.on_select_color(option)}
          />
        );
      })}
    </>
  );
}




