import { GetServerSideProps } from "next";
import * as RadixPopover from "@radix-ui/react-popover";
import * as RadixModal from "@radix-ui/react-dialog";
import { BASE_COLORS, BaseColor } from "src/utils/colors";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { Spinner } from "src/components/Spinner";
import { getServerAuthSession } from "src/server/auth";
import {
  BUTTON_HOVER_CLASSES,
  EXPENSES_ROUTE,
  RADIX_MODAL_CONTENT_CLASSES,
  RADIX_MODAL_OVERLAY_CLASSES,
} from "src/utils/constants";
import { SPINNER_CLASSNAMES } from ".";
import basil_logo_light from "public/basil-logo-light.png";
import basil_logo_dark from "public/basil-logo-dark.png";

import Image from "next/image";
import { useTheme } from "next-themes";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import { cn } from "src/utils/cn";
import { is_valid_amount, is_valid_date } from "./expenses";
import { ExpenseCategoryWithBaseColor } from "src/server/api/routers/router";
import { Expense } from "@prisma/client";

//I should probably understand how this works, but I just ripped it from https://create.t3.gg/en/usage/next-auth
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
export default function SignIn() {
  const session = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  console.log(theme);

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push(EXPENSES_ROUTE);
    }
  }, [session.status]);

  if (session.status === "loading" || session.status === "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
        <Spinner className={SPINNER_CLASSNAMES} />
      </div>
    );
  }
  return (
    <div className="flex h-[100vh] flex-col justify-center md:flex-row md:items-center">
      <div className="flex flex-col items-start justify-center gap-3 rounded-lg px-4  py-8 md:h-full md:w-[50%] md:gap-6 md:p-16">
        <Image
          className="w-40 md:w-72"
          src={theme === "dark" ? basil_logo_dark : basil_logo_light}
          alt="Basil logo"
        />
        <p className="text-base text-slate-700 dark:text-white md:text-2xl md:text-lg">
          A minimalistic expense tracker
        </p>
        <button
          className="rounded-full bg-squirtle px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 dark:bg-rengar md:px-6 md:py-2 md:text-3xl md:text-lg"
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      </div>
      <BasilPreview />
    </div>
  );
}

function BasilPreview() {
  const [page, set_page] = useState<"expenses" | "visualize">("expenses");
  return (
    <div className="h-full px-2 py-4 md:w-[80%]">
      <div className="flex gap-3">
        <button
          className={cn(
            "rounded-full",
            "w-[6rem] border border-squirtle py-1 text-sm font-semibold text-squirtle dark:border-transparent",
            "hover:brightness-110 dark:text-rengar md:w-[8rem] md:text-lg",
            BUTTON_HOVER_CLASSES
          )}
          onClick={() => set_page("expenses")}
        >
          Expenses
        </button>
        <button
          className={cn(
            "rounded-full",
            "w-[6rem] border border-squirtle py-1 text-sm font-semibold text-squirtle dark:border-transparent",
            "hover:brightness-110 dark:text-rengar md:w-[8rem] md:text-lg",
            BUTTON_HOVER_CLASSES
          )}
          onClick={() => set_page("visualize")}
        >
          Visualize
        </button>
      </div>
      {page === "expenses" && <ExpensesPreview />}
      {page === "visualize" && <VisualizePreview />}
    </div>
  );
}

type BasilDay = {
  month: number;
  day: number;
  year: number
  expenses: Expense[]
  //   user_id  String
  //   user     User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  //   createdAt   DateTime        @default(now())
  //   month    Int
  //   day      Int
  //   year     Int
  //   expenses Expense[]
}
function ExpensesPreview() {
  const today = new Date();
  const [expenses_by_day, set_expenses_by_day] = useState<BasilDay[]>([]);
  // model Day {
  //   id       String    @id @default(cuid())
  //   user_id  String
  //   user     User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  //   createdAt   DateTime        @default(now())
  //   month    Int
  //   day      Int
  //   year     Int
  //   expenses Expense[]
  //
  //   @@unique([user_id, month, day, year])
  // }
  return (
    <div className="relative">
      <ul>
        {expenses_by_day.length === 0 && (
          <div className="flex items-center justify-center">
            <h1 className="text-slate-700 dark:text-white">
              Click the '+' button to add a new expense.
            </h1>
          </div>
        )}
        {expenses_by_day.length > 0 && expenses_by_day.map((ebd) => {
          return (
            <li className="px-1 py-4">
              <div className="flex items-end justify-between ">
                <h1 className="inline rounded-lg bg-squirtle px-2 py-1 font-bold text-white dark:bg-rengar md:p-2">
                  {ebd.month + 1}-{ebd.day}-{ebd.year}
                </h1>
              </div>
              <div className="h-4" />
              <ul className="flex flex-col gap-3 rounded-lg bg-pikachu p-4 shadow-sm dark:bg-leblanc dark:shadow-sm dark:shadow-leblanc">
                <Jason />
                <li className="flex justify-between">
                  <p className="font-semibold text-squirtle dark:text-rengar">
                    Total:{" "}
                  </p>
                  <p className="font-semibold text-squirtle dark:text-rengar">
                    $100.23
                  </p>
                </li>
              </ul>
            </li>
          );
        })}

      </ul>
      <AddNewExpenseButtonAndModal
        triggerClassnames={cn(
          "bg-squirtle dark:bg-rengar fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full p-0 shadow shadow-blue-300 hover:cursor-pointer",
          "md:bottom-14 md:right-14 md:h-14 md:w-14",
          "lg:shadow-md lg:shadow-blue-300 lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-lg lg:hover:shadow-blue-300 lg:hover:brightness-110"
        )}
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
    </div>
  );
}

function VisualizePreview() {
  return <div>Visualize</div>;
}

function Jason() {
  return (
    <li>
      <div className="flex justify-between">
        <h2
          className={cn(
            "flex items-center rounded-lg",
            "px-2 py-1 text-sm font-bold md:text-base ",
            TW_COLORS_MP["bg"]["pink"][200],
            TW_COLORS_MP["text"]["pink"][700]
          )}
        >
          Groceries +
        </h2>
        <p className="font-semibold text-squirtle dark:text-rengar">$83.45</p>
      </div>
      <ul className="flex flex-wrap gap-1 py-2">
        <li>
          <button
            className={cn(
              TW_COLORS_MP["bg"]["pink"][500],
              "rounded-full px-2 text-white hover:cursor-pointer hover:opacity-80 dark:hover:opacity-100 dark:hover:brightness-110"
            )}
          // title="Delete expense"
          >
            $83.45
          </button>
        </li>
      </ul>
    </li>
  );
}

function AddNewExpenseButtonAndModal({
  triggerClassnames,
  month,
  day,
  year,
  expense_category_name,
  expense_category_color,
  children,
}: {
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
  const [expense_categories, set_expense_categories] = useState<
    ExpenseCategoryWithBaseColor[]
  >([]);

  //api.router.get_categories.useQuery();
  //
  // const create_expense_mtn = api.router.create_expense.useMutation({
  //   onSuccess: () => {
  //     set_is_modal_open(false);
  //     expense_data_qry.invalidate_queries();
  //   },
  //   onError: (err, data, ctx) => {
  //     console.log(err, data);
  //     alert("error");
  //   },
  // });
  // const create_category_and_expense_mtn =
  //   api.router.create_category.useMutation({
  //     onSuccess: (data) => {
  //       create_expense_mtn.mutate({
  //         category_id: data.id,
  //         amount: amount,
  //         date: extract_date_fields(date),
  //       });
  //     },
  //     onError: () => {
  //       alert("error in create_caegory_and_expense");
  //     },
  //   });
  //
  function handle_create_expense(
    expense_categories: ExpenseCategoryWithBaseColor[]
  ) {

    // id: string
    // user_id: string
    // createdAt: Date
    // updatedAt: Date
    // color: string
    // name: string
    const does_category_exist =
      expense_categories.filter((exp) => exp.name === category_text).length > 0;
    if (!does_category_exist) {
      set_expense_categories((prev) => [...prev, { id: category_text, user_id: "", createdAt: new Date(), updatedAt: new Date(), color: color, name: category_text }]);
    }

    // } else {
    //   const id = expense_categories.find((c) => c.name === category_text)?.id;
    //   if (!id) throw new Error("id undefined");
    //   create_expense_mtn.mutate({
    //     category_id: id,
    //     amount: amount,
    //     date: extract_date_fields(date),
    //   });
    // }
  }
  // if (expense_categories_qry.status === "error") {
  //   console.error(expense_categories_qry.error);
  // }
  //
  const is_create_expense_button_disabled =
    category_text.length === 0 ||
    color.length === 0 ||
    amount.length === 0 ||
    !is_valid_amount(amount) ||
    !is_valid_date(date) ||
    is_category_dropdown_open; //This is because if the dropdown is still open, that indicates that the user hasn't selected something yet

  const does_category_exist =
    expense_categories.filter((cat) => cat.name === category_text).length !== 0;

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
          // disabled={
          //   expense_categories_qry.status === "loading" ||
          //   expense_categories_qry.status === "error"
          // }
          // onClick={() => set_is_modal_open(true)}
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
              handle_create_expense(expense_categories);
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
                            {expense_categories
                              .filter(
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
                  is_create_expense_button_disabled ?
                    "opacity-50"
                    : "hover:cursor-pointer hover:brightness-110"
                )}
                type="submit"
                disabled={is_create_expense_button_disabled}
              >
                Create
              </button>
            </div>
          </form>
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );
}
