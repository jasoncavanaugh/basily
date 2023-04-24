import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { useState } from "react";
import { api } from "src/utils/api";

const Home: NextPage = () => {
  const hello = api.expense.hello.useQuery({ text: "from tRPC" });

  return (
    <div className="p-1 md:p-4">
      <div className="flex flex-col-reverse items-end justify-end gap-2 px-1 pt-2  md:flex-row md:pt-0">
        <button
          className="rounded-full bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-pink-500 hover:brightness-110 md:px-5 md:text-lg"
          onClick={() => void signOut()}
        >
          Log Out
        </button>
      </div>
      <div className="h-2 md:h-4" />
      <ul className="flex flex-col gap-4 rounded-lg bg-slate-500 p-2 md:p-4"></ul>
      <AddNewHabitButtonAndModal />
    </div>
  );
};

export default Home;

function AddNewHabitButtonAndModal() {
  const [name, set_name] = useState("");
  const [is_modal_open, set_is_modal_open] = useState(false);

  return (
    <button
      type="button"
      className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-togglPeach text-3xl font-bold text-white md:bottom-16 md:right-16 lg:shadow-md lg:shadow-red-300 lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-red-300 lg:hover:brightness-110"
      onClick={() => set_is_modal_open(true)}
    >
      +
    </button>
  );
}
