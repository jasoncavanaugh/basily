import { type NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  EXPENSES_ROUTE,
  SIGN_IN_ROUTE,
  SPINNER_CLASSES,
} from "src/utils/constants";
import { Spinner } from "src/components/Spinner";

const Home: NextPage = () => {
  // function Home(): NextPage {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push(EXPENSES_ROUTE);
    } else if (session.status === "unauthenticated") {
      router.push(SIGN_IN_ROUTE);
    }
  }, [session.status]);

  return (
    <div className="flex h-screen items-center justify-center bg-charmander p-1 dark:bg-khazix md:p-4">
      <Spinner className={SPINNER_CLASSES} />
    </div>
  );
  // }

  // if (session.status === "unauthenticated") {
  //   router.push("/sign-in");
  //return <SignIn />;
  // router.push("/sign-in");
  // return (
  //   <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
  //     <button
  //       className="rounded-full bg-squirtle px-6 py-2 text-3xl font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 dark:bg-rengar"
  //       onClick={() => void signIn()}
  //     >
  //       Sign In
  //     </button>
  //   </div>
  // );
  // }
  // router.push("/expenses");
  //return <Expenses />
  //
  // router.push("/expenses")

  // return (
  //   <div className="bg-charmander dark:bg-khazix">
  //     <div className="h-full bg-charmander dark:bg-khazix md:p-4">
  //       <div className="flex items-center justify-between px-2 pt-2 md:pt-0">
  //         <button
  //           className={cn(
  //             "rounded-full",
  //             "w-[6rem] border border-squirtle py-1 text-sm font-semibold text-squirtle dark:border-transparent",
  //             "hover:brightness-110 dark:text-rengar md:w-[8rem] md:text-lg",
  //             BUTTON_HOVER_CLASSES
  //           )}
  //           onClick={() =>
  //             set_page(page === "visualize" ? "expenses" : "visualize")
  //           }
  //         >
  //           {page === "visualize" ? "Expenses" : "Visualize"}
  //         </button>
  //         <div className="flex items-center justify-end gap-2 lg:gap-4">
  //           <ThemeButton />
  //           <button
  //             className="rounded-full bg-squirtle px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-blue-300 hover:brightness-110 dark:bg-rengar md:px-5 md:text-lg"
  //             onClick={() => void signOut()}
  //           >
  //             Log Out
  //           </button>
  //         </div>
  //       </div>
  //       <div className="h-2 md:h-4" />
  //       {page === "expenses" && <Expenses />}
  //       {page === "visualize" && <Visualize />}
  //       <AddNewExpenseButtonAndModal />
  //     </div>
  //   </div>
  // );
};

export default Home;
