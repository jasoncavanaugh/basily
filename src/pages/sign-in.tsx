import { GetServerSideProps } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Spinner } from "src/components/Spinner";
import { getServerAuthSession } from "src/server/auth";
import { BUTTON_HOVER_CLASSES, EXPENSES_ROUTE } from "src/utils/constants";
import { SPINNER_CLASSNAMES } from ".";
import basil_logo_light from "public/basil-logo-light.png";
import basil_logo_dark from "public/basil-logo-dark.png";

import Image from 'next/image'
import { useTheme } from "next-themes";
import { TW_COLORS_MP } from "src/utils/tailwindColorsMp";
import { cn } from "src/utils/cn";

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
    <div className="flex flex-col md:flex-row h-[100vh] items-center justify-center border border-red-500">
      <div className="flex flex-col gap-6 border rounded-lg p-16 h-full justify-center w-[50%] items-start">
        <Image
          src={theme === "dark" ? basil_logo_dark : basil_logo_light}
          width={500}
          height={500}
          alt="Picture of the author"
        />
        <p className="text-2xl text-slate-700 dark:text-white">
          Expense tracking made simple
        </p>
        <button
          className="rounded-full bg-squirtle px-6 py-2 text-3xl font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 dark:bg-rengar"
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      </div>
      <div className="w-[80%] h-full  relative p-4">
        <div className="flex gap-3">
        <button
          className={cn(
            "rounded-full",
            "w-[6rem] border border-squirtle py-1 text-sm font-semibold text-squirtle dark:border-transparent",
            "hover:brightness-110 dark:text-rengar md:w-[8rem] md:text-lg",
            BUTTON_HOVER_CLASSES
          )}
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
        >
          Visualize
        </button>
        </div>
        <ul>
        <li className="px-3 py-4">
          <div className="flex items-end justify-between ">
            <h1 className="inline rounded-lg bg-squirtle px-2 py-1 font-bold text-white dark:bg-rengar md:p-2">
              12-1-2023
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
        </ul>

      </div>
    </div>
  );
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
        <p className="font-semibold text-squirtle dark:text-rengar">
          $83.45
        </p>
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
