import { useEffect } from "react";

export function ThemeButton({
  is_dark_theme,
  set_is_dark_theme,
}: {
  is_dark_theme: boolean;
  set_is_dark_theme: (is_dark_theme: boolean) => void;
}) {
  console.log("Rendering ThemeButton.tsx");
  return (
    <button
      onClick={() => {
        if (typeof localStorage === "undefined") {
          return;
        }
        if (is_dark_theme) {
          localStorage.removeItem("is_dark");
        } else {
          localStorage.setItem("is_dark", "true");
        }
        set_is_dark_theme(!is_dark_theme);
      }}
      className="flex
      items-center
      justify-center
      rounded-full
      border-2
      border-transparent
      p-2
      text-lg
      text-white
      !outline-none
      hover:bg-zero_zero_HighHigh
      focus:border-gray-500
      dark:text-gray-200
      dark:hover:border-gray-700
      dark:hover:bg-gray-700
      dark:hover:text-gray-200
      dark:focus:border-gray-700
      dark:focus:text-gray-200"
      title={is_dark_theme ? "Toggle light mode" : "Toggle dark mode"}
    >
      {is_dark_theme && <DarkThemeIcon />}
      {!is_dark_theme && <LightThemeIcon />}
    </button>
  );
}

function DarkThemeIcon() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 32 32"
    >
      <path
        d="M16 12.005a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6z"
        fill="currentColor"
      ></path>
      <path
        d="M5.394 6.813l1.414-1.415l3.506 3.506L8.9 10.318z"
        fill="currentColor"
      ></path>
      <path d="M2 15.005h5v2H2z" fill="currentColor"></path>
      <path
        d="M5.394 25.197L8.9 21.691l1.414 1.415l-3.506 3.505z"
        fill="currentColor"
      ></path>
      <path d="M15 25.005h2v5h-2z" fill="currentColor"></path>
      <path
        d="M21.687 23.106l1.414-1.415l3.506 3.506l-1.414 1.414z"
        fill="currentColor"
      ></path>
      <path d="M25 15.005h5v2h-5z" fill="currentColor"></path>
      <path
        d="M21.687 8.904l3.506-3.506l1.414 1.415l-3.506 3.505z"
        fill="currentColor"
      ></path>
      <path d="M15 2.005h2v5h-2z" fill="currentColor"></path>
    </svg>
  );
}

function LightThemeIcon() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 32 32"
    >
      <path
        color="gray"
        d="M13.502 5.414a15.075 15.075 0 0 0 11.594 18.194a11.113 11.113 0 0 1-7.975 3.39c-.138 0-.278.005-.418 0a11.094 11.094 0 0 1-3.2-21.584M14.98 3a1.002 1.002 0 0 0-.175.016a13.096 13.096 0 0 0 1.825 25.981c.164.006.328 0 .49 0a13.072 13.072 0 0 0 10.703-5.555a1.01 1.01 0 0 0-.783-1.565A13.08 13.08 0 0 1 15.89 4.38A1.015 1.015 0 0 0 14.98 3z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
