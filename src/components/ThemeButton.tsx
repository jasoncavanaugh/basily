import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

export function ThemeButton({
  className = "",
  showText,
}: {
  className?: string;
  showText: boolean;
}) {
  const { theme, setTheme } = useTheme();

  //Honestly, this stuff is ridiculous imo. How is this the official way to do things??
  const [is_mounted, set_is_mounted] = useState(false);
  useEffect(() => {
    set_is_mounted(true);
  }, []);

  if (!is_mounted) {
    return null;
  }
  return (
    <button
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
      className={cn(
        "flex gap-4 rounded-md p-2 hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-jinx",
        className
      )}
    >
      {theme === "light" ? (
        <Moon strokeWidth="0.08rem" className="text-gray-500" />
      ) : (
        <Sun strokeWidth="0.08rem" />
      )}
      {showText && <p>{theme === "light" ? "Dark Theme" : "Light Theme"}</p>}
    </button>
  );
}
