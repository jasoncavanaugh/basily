import { GetServerSideProps, type NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  EXPENSES_ROUTE,
  SIGN_IN_ROUTE,
  SPINNER_CLASSES,
} from "src/utils/constants";
import { Spinner } from "src/components/Spinner";
import { getServerAuthSession } from "src/server/auth";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
const Home: NextPage = () => {
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
};
export default Home;
