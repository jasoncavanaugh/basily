import { signIn } from "next-auth/react";

export function SignIn() {
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
