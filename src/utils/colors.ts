export const COLOR_OPTIONS = [
  "rose-500",
  "pink-500",
  "fuchsia-500",
  "purple-500",
  "violet-500",
  "indigo-500",
  "blue-500",
  "sky-500",
  "cyan-500",
  "teal-500",
  "emerald-500",
  "green-500",
  "lime-500",
  "yellow-500",
  "amber-500",
  "orange-500",
  "red-500",
  "slate-500",
] as const;
export type ColorOption = (typeof COLOR_OPTIONS)[number];

//Tailwind purge
export const COLOR_TO_CLASSNAME = {
  "rose-500": {
    bg: "bg-rose-500",
    border: "border-rose-500",
  },
  "pink-500": {
    bg: "bg-pink-500",
    border: "border-pink-500",
  },
  "fuchsia-500": {
    bg: "bg-fuchsia-500",
    border: "border-fuchsia-500",
  },
  "purple-500": {
    bg: "bg-purple-500",
    border: "border-purple-500",
  },
  "violet-500": {
    bg: "bg-violet-500",
    border: "border-violet-500",
  },
  "indigo-500": {
    bg: "bg-indigo-500",
    border: "border-indigo-500",
  },
  "blue-500": {
    bg: "bg-blue-500",
    border: "border-blue-500",
  },
  "sky-500": {
    bg: "bg-sky-500",
    border: "border-sky-500",
  },
  "cyan-500": {
    bg: "bg-cyan-500",
    border: "border-cyan-500",
  },
  "teal-500": {
    bg: "bg-teal-500",
    border: "border-teal-500",
  },
  "emerald-500": {
    bg: "bg-emerald-500",
    border: "border-emerald-500",
  },
  "green-500": {
    bg: "bg-green-500",
    border: "border-green-500",
  },
  "lime-500": {
    bg: "bg-lime-500",
    border: "border-lime-500",
  },
  "yellow-500": {
    bg: "bg-yellow-500",
    border: "border-yellow-500",
  },
  "amber-500": {
    bg: "bg-amber-500",
    border: "border-amber-500",
  },
  "orange-500": {
    bg: "bg-orange-500",
    border: "border-orange-500",
  },
  "red-500": {
    bg: "bg-red-500",
    border: "border-red-500",
  },
  "stone-500": {
    bg: "bg-stone-500",
    border: "border-stone-500",
  },
  "neutral-500": {
    bg: "bg-neutral-500",
    border: "border-neutral-500",
  },
  "zinc-500": {
    bg: "bg-zinc-500",
    border: "border-zinc-500",
  },
  "gray-500": {
    bg: "bg-gray-500",
    border: "border-gray-500",
  },
  "slate-500": {
    bg: "bg-slate-500",
    border: "border-slate-500",
  },
} as const;
