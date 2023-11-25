import { GetServerSideProps } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Spinner } from "src/components/Spinner";
import { getServerAuthSession } from "src/server/auth";
import { EXPENSES_ROUTE } from "src/utils/constants";
import { SPINNER_CLASSNAMES } from ".";

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
