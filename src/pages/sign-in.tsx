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
      <div className="bg-charmander dark:bg-khazix flex h-screen items-center justify-center p-1 md:p-4">
        <Spinner className={SPINNER_CLASSNAMES} />
      </div>
    );
  }
  return (
    <div className="flex h-[100vh] flex-col md:items-center justify-center md:flex-row">
      <div className="flex flex-col items-start justify-center gap-3 md:gap-6 rounded-lg  py-8 px-4 md:h-full md:w-[50%] md:p-16">
        <Image
          className="w-40 md:w-72"
          src={theme === "dark" ? basil_logo_dark : basil_logo_light}
          alt="Basil logo"
        />
        <p className="text-base md:text-lg text-slate-700 dark:text-white md:text-2xl">
          A minimalistic expense tracker
        </p>
        <button
          className="bg-squirtle dark:bg-rengar rounded-full px-3 py-1 md:px-6 md:py-2 text-sm font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 md:text-lg md:text-3xl"
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
    <div className="h-full md:w-[80%] py-4 px-2">
      <div className="flex gap-3">
        <button
          className={cn(
            "rounded-full",
            "border-squirtle text-squirtle w-[6rem] border py-1 text-sm font-semibold dark:border-transparent",
            "dark:text-rengar hover:brightness-110 md:w-[8rem] md:text-lg",
            BUTTON_HOVER_CLASSES
          )}
          onClick={() => set_page("expenses")}
        >
          Expenses
        </button>
        <button
          className={cn(
            "rounded-full",
            "border-squirtle text-squirtle w-[6rem] border py-1 text-sm font-semibold dark:border-transparent",
            "dark:text-rengar hover:brightness-110 md:w-[8rem] md:text-lg",
            BUTTON_HOVER_CLASSES
          )}
          onClick={() => set_page("visualize")}
        >
          Visualize
        </button>
      </div>
      {page === "expenses" && (
        <ExpensesPreview />
      )}
      {page === "visualize" && (
        <VisualizePreview />
      )}
    </div>
  );
}

function ExpensesPreview() {
  const today = new Date();
  return (
    <div className="relative">
      <ul>
        <li className="px-1 py-4">
          <div className="flex items-end justify-between ">
            <h1 className="bg-squirtle dark:bg-rengar inline rounded-lg px-2 py-1 font-bold text-white md:p-2">
              12-1-2023
            </h1>
          </div>
          <div className="h-4" />
          <ul className="bg-pikachu dark:bg-leblanc dark:shadow-leblanc flex flex-col gap-3 rounded-lg p-4 shadow-sm dark:shadow-sm">
            <Jason />
            <li className="flex justify-between">
              <p className="text-squirtle dark:text-rengar font-semibold">
                Total:{" "}
              </p>
              <p className="text-squirtle dark:text-rengar font-semibold">
                $100.23
              </p>
            </li>
          </ul>
        </li>
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
        <p className="text-squirtle dark:text-rengar font-semibold">$83.45</p>
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
  //
  // const expense_data_qry = use_expenses();
  // const expense_categories_qry = api.router.get_categories.useQuery();
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
  // function handle_create_expense(
  //   expense_categories: ExpenseCategoryWithBaseColor[]
  // ) {
  //   const does_category_exist =
  //     expense_categories.filter((exp) => exp.name === category_text).length > 0;
  //   if (!does_category_exist) {
  //     create_category_and_expense_mtn.mutate({
  //       name: category_text,
  //       color: color,
  //     });
  //   } else {
  //     const id = expense_categories.find((c) => c.name === category_text)?.id;
  //     if (!id) throw new Error("id undefined");
  //     create_expense_mtn.mutate({
  //       category_id: id,
  //       amount: amount,
  //       date: extract_date_fields(date),
  //     });
  //   }
  // }
  // if (expense_categories_qry.status === "error") {
  //   console.error(expense_categories_qry.error);
  // }
  //
  // const is_create_expense_button_disabled =
  //   category_text.length === 0 ||
  //   color.length === 0 ||
  //   amount.length === 0 ||
  //   !is_valid_amount(amount) ||
  //   !is_valid_date(date) ||
  //   is_category_dropdown_open; //This is because if the dropdown is still open, that indicates that the user hasn't selected something yet
  //
  // const does_category_exist =
  //   expense_categories_qry.data?.filter((cat) => cat.name === category_text)
  //     .length !== 0;

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
            "border-t-squirtle bg-pikachu dark:border-t-rengar dark:bg-leblanc fixed left-1/2 top-0 w-full -translate-x-1/2 rounded border-t-8",
            "p-4 md:top-1/2 md:w-[40rem] md:-translate-y-1/2 md:rounded-lg lg:p-8"
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // handle_create_expense(expense_categories_qry.data!);
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
                // onClick={() => {
                //   if (does_category_exist) return;
                //   set_is_color_selection_open(!is_color_selection_open);
                // }}
                // className={cn(
                //   "h-4 w-4 shrink-0 rounded-full md:h-6 md:w-6",
                //   TW_COLORS_MP["bg"][color][500],
                //   does_category_exist
                //     ? "hover:cursor-not-allowed"
                //     : "hover:cursor-pointer hover:brightness-110"
                // )}
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
                            "border-pikachu dark:border-leblanc focus:border-black focus:outline-none dark:focus:border-white",
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
                  "bg-squirtle dark:bg-rengar flex w-[4.5rem] items-center justify-center rounded-full text-xs font-semibold text-white lg:h-[3rem] lg:w-[7rem] lg:text-base lg:font-bold",
                  true
                    ? //is_create_expense_button_disabled
                    "opacity-50"
                    : "hover:cursor-pointer hover:brightness-110"
                )}
                type="submit"
              // disabled={is_create_expense_button_disabled}
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
