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

export const BASE_COLORS = [
  "rose",
  "pink",
  "fuchsia",
  "purple",
  "violet",
  "indigo",
  "blue",
  "sky",
  "cyan",
  "teal",
  "emerald",
  "green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "red",
  "slate",
] as const;

export type BaseColor = (typeof BASE_COLORS)[number];
type BaseColorPrefix = "bg" | "border";

const COLOR_VALUES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;
type ColorValue = (typeof COLOR_VALUES)[number];

export function construct_color(
  base_color_prefix: BaseColorPrefix,
  base_color: BaseColor,
  color_value: ColorValue
) {
  return `${base_color_prefix}-${base_color}-${color_value}`;
}
// //Tailwind purge
// export const COLOR_TO_CLASSNAME = {
//   "rose-500": {
//     bg: "bg-rose-500",
//     border: "border-rose-500",
//   },
//   "pink-500": {
//     bg: "bg-pink-500",
//     border: "border-pink-500",
//   },
//   "fuchsia-500": {
//     bg: "bg-fuchsia-500",
//     border: "border-fuchsia-500",
//   },
//   "purple-500": {
//     bg: "bg-purple-500",
//     border: "border-purple-500",
//   },
//   "violet-500": {
//     bg: "bg-violet-500",
//     border: "border-violet-500",
//   },
//   "indigo-500": {
//     bg: "bg-indigo-500",
//     border: "border-indigo-500",
//   },
//   "blue-500": {
//     bg: "bg-blue-500",
//     border: "border-blue-500",
//   },
//   "sky-500": {
//     bg: "bg-sky-500",
//     border: "border-sky-500",
//   },
//   "cyan-500": {
//     bg: "bg-cyan-500",
//     border: "border-cyan-500",
//   },
//   "teal-500": {
//     bg: "bg-teal-500",
//     border: "border-teal-500",
//   },
//   "emerald-500": {
//     bg: "bg-emerald-500",
//     border: "border-emerald-500",
//   },
//   "green-500": {
//     bg: "bg-green-500",
//     border: "border-green-500",
//   },
//   "lime-500": {
//     bg: "bg-lime-500",
//     border: "border-lime-500",
//   },
//   "yellow-500": {
//     bg: "bg-yellow-500",
//     border: "border-yellow-500",
//   },
//   "amber-500": {
//     bg: "bg-amber-500",
//     border: "border-amber-500",
//   },
//   "orange-500": {
//     bg: "bg-orange-500",
//     border: "border-orange-500",
//   },
//   "red-500": {
//     bg: "bg-red-500",
//     border: "border-red-500",
//   },
//   "stone-500": {
//     bg: "bg-stone-500",
//     border: "border-stone-500",
//   },
//   "neutral-500": {
//     bg: "bg-neutral-500",
//     border: "border-neutral-500",
//   },
//   "zinc-500": {
//     bg: "bg-zinc-500",
//     border: "border-zinc-500",
//   },
//   "gray-500": {
//     bg: "bg-gray-500",
//     border: "border-gray-500",
//   },
//   "slate-500": {
//     bg: "bg-slate-500",
//     border: "border-slate-500",
//   },
// } as const;

//Ugh... The dark side of Tailwind
const tailwind_colors = [
  "bg-rose-50",
  "bg-rose-100",
  "bg-rose-200",
  "bg-rose-300",
  "bg-rose-400",
  "bg-rose-500",
  "bg-rose-600",
  "bg-rose-700",
  "bg-rose-800",
  "bg-rose-900",
  "bg-rose-950",
  "border-rose-50",
  "border-rose-100",
  "border-rose-200",
  "border-rose-300",
  "border-rose-400",
  "border-rose-500",
  "border-rose-600",
  "border-rose-700",
  "border-rose-800",
  "border-rose-900",
  "border-rose-950",
  "bg-pink-50",
  "bg-pink-100",
  "bg-pink-200",
  "bg-pink-300",
  "bg-pink-400",
  "bg-pink-500",
  "bg-pink-600",
  "bg-pink-700",
  "bg-pink-800",
  "bg-pink-900",
  "bg-pink-950",
  "border-pink-50",
  "border-pink-100",
  "border-pink-200",
  "border-pink-300",
  "border-pink-400",
  "border-pink-500",
  "border-pink-600",
  "border-pink-700",
  "border-pink-800",
  "border-pink-900",
  "border-pink-950",
  "bg-fuchsia-50",
  "bg-fuchsia-100",
  "bg-fuchsia-200",
  "bg-fuchsia-300",
  "bg-fuchsia-400",
  "bg-fuchsia-500",
  "bg-fuchsia-600",
  "bg-fuchsia-700",
  "bg-fuchsia-800",
  "bg-fuchsia-900",
  "bg-fuchsia-950",
  "border-fuchsia-50",
  "border-fuchsia-100",
  "border-fuchsia-200",
  "border-fuchsia-300",
  "border-fuchsia-400",
  "border-fuchsia-500",
  "border-fuchsia-600",
  "border-fuchsia-700",
  "border-fuchsia-800",
  "border-fuchsia-900",
  "border-fuchsia-950",
  "bg-purple-50",
  "bg-purple-100",
  "bg-purple-200",
  "bg-purple-300",
  "bg-purple-400",
  "bg-purple-500",
  "bg-purple-600",
  "bg-purple-700",
  "bg-purple-800",
  "bg-purple-900",
  "bg-purple-950",
  "border-purple-50",
  "border-purple-100",
  "border-purple-200",
  "border-purple-300",
  "border-purple-400",
  "border-purple-500",
  "border-purple-600",
  "border-purple-700",
  "border-purple-800",
  "border-purple-900",
  "border-purple-950",
  "bg-violet-50",
  "bg-violet-100",
  "bg-violet-200",
  "bg-violet-300",
  "bg-violet-400",
  "bg-violet-500",
  "bg-violet-600",
  "bg-violet-700",
  "bg-violet-800",
  "bg-violet-900",
  "bg-violet-950",
  "border-violet-50",
  "border-violet-100",
  "border-violet-200",
  "border-violet-300",
  "border-violet-400",
  "border-violet-500",
  "border-violet-600",
  "border-violet-700",
  "border-violet-800",
  "border-violet-900",
  "border-violet-950",
  "bg-indigo-50",
  "bg-indigo-100",
  "bg-indigo-200",
  "bg-indigo-300",
  "bg-indigo-400",
  "bg-indigo-500",
  "bg-indigo-600",
  "bg-indigo-700",
  "bg-indigo-800",
  "bg-indigo-900",
  "bg-indigo-950",
  "border-indigo-50",
  "border-indigo-100",
  "border-indigo-200",
  "border-indigo-300",
  "border-indigo-400",
  "border-indigo-500",
  "border-indigo-600",
  "border-indigo-700",
  "border-indigo-800",
  "border-indigo-900",
  "border-indigo-950",
  "bg-blue-50",
  "bg-blue-100",
  "bg-blue-200",
  "bg-blue-300",
  "bg-blue-400",
  "bg-blue-500",
  "bg-blue-600",
  "bg-blue-700",
  "bg-blue-800",
  "bg-blue-900",
  "bg-blue-950",
  "border-blue-50",
  "border-blue-100",
  "border-blue-200",
  "border-blue-300",
  "border-blue-400",
  "border-blue-500",
  "border-blue-600",
  "border-blue-700",
  "border-blue-800",
  "border-blue-900",
  "border-blue-950",
  "bg-sky-50",
  "bg-sky-100",
  "bg-sky-200",
  "bg-sky-300",
  "bg-sky-400",
  "bg-sky-500",
  "bg-sky-600",
  "bg-sky-700",
  "bg-sky-800",
  "bg-sky-900",
  "bg-sky-950",
  "border-sky-50",
  "border-sky-100",
  "border-sky-200",
  "border-sky-300",
  "border-sky-400",
  "border-sky-500",
  "border-sky-600",
  "border-sky-700",
  "border-sky-800",
  "border-sky-900",
  "border-sky-950",
  "bg-cyan-50",
  "bg-cyan-100",
  "bg-cyan-200",
  "bg-cyan-300",
  "bg-cyan-400",
  "bg-cyan-500",
  "bg-cyan-600",
  "bg-cyan-700",
  "bg-cyan-800",
  "bg-cyan-900",
  "bg-cyan-950",
  "border-cyan-50",
  "border-cyan-100",
  "border-cyan-200",
  "border-cyan-300",
  "border-cyan-400",
  "border-cyan-500",
  "border-cyan-600",
  "border-cyan-700",
  "border-cyan-800",
  "border-cyan-900",
  "border-cyan-950",
  "bg-teal-50",
  "bg-teal-100",
  "bg-teal-200",
  "bg-teal-300",
  "bg-teal-400",
  "bg-teal-500",
  "bg-teal-600",
  "bg-teal-700",
  "bg-teal-800",
  "bg-teal-900",
  "bg-teal-950",
  "border-teal-50",
  "border-teal-100",
  "border-teal-200",
  "border-teal-300",
  "border-teal-400",
  "border-teal-500",
  "border-teal-600",
  "border-teal-700",
  "border-teal-800",
  "border-teal-900",
  "border-teal-950",
  "bg-emerald-50",
  "bg-emerald-100",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-400",
  "bg-emerald-500",
  "bg-emerald-600",
  "bg-emerald-700",
  "bg-emerald-800",
  "bg-emerald-900",
  "bg-emerald-950",
  "border-emerald-50",
  "border-emerald-100",
  "border-emerald-200",
  "border-emerald-300",
  "border-emerald-400",
  "border-emerald-500",
  "border-emerald-600",
  "border-emerald-700",
  "border-emerald-800",
  "border-emerald-900",
  "border-emerald-950",
  "bg-green-50",
  "bg-green-100",
  "bg-green-200",
  "bg-green-300",
  "bg-green-400",
  "bg-green-500",
  "bg-green-600",
  "bg-green-700",
  "bg-green-800",
  "bg-green-900",
  "bg-green-950",
  "border-green-50",
  "border-green-100",
  "border-green-200",
  "border-green-300",
  "border-green-400",
  "border-green-500",
  "border-green-600",
  "border-green-700",
  "border-green-800",
  "border-green-900",
  "border-green-950",
  "bg-lime-50",
  "bg-lime-100",
  "bg-lime-200",
  "bg-lime-300",
  "bg-lime-400",
  "bg-lime-500",
  "bg-lime-600",
  "bg-lime-700",
  "bg-lime-800",
  "bg-lime-900",
  "bg-lime-950",
  "border-lime-50",
  "border-lime-100",
  "border-lime-200",
  "border-lime-300",
  "border-lime-400",
  "border-lime-500",
  "border-lime-600",
  "border-lime-700",
  "border-lime-800",
  "border-lime-900",
  "border-lime-950",
  "bg-yellow-50",
  "bg-yellow-100",
  "bg-yellow-200",
  "bg-yellow-300",
  "bg-yellow-400",
  "bg-yellow-500",
  "bg-yellow-600",
  "bg-yellow-700",
  "bg-yellow-800",
  "bg-yellow-900",
  "bg-yellow-950",
  "border-yellow-50",
  "border-yellow-100",
  "border-yellow-200",
  "border-yellow-300",
  "border-yellow-400",
  "border-yellow-500",
  "border-yellow-600",
  "border-yellow-700",
  "border-yellow-800",
  "border-yellow-900",
  "border-yellow-950",
  "bg-amber-50",
  "bg-amber-100",
  "bg-amber-200",
  "bg-amber-300",
  "bg-amber-400",
  "bg-amber-500",
  "bg-amber-600",
  "bg-amber-700",
  "bg-amber-800",
  "bg-amber-900",
  "bg-amber-950",
  "border-amber-50",
  "border-amber-100",
  "border-amber-200",
  "border-amber-300",
  "border-amber-400",
  "border-amber-500",
  "border-amber-600",
  "border-amber-700",
  "border-amber-800",
  "border-amber-900",
  "border-amber-950",
  "bg-orange-50",
  "bg-orange-100",
  "bg-orange-200",
  "bg-orange-300",
  "bg-orange-400",
  "bg-orange-500",
  "bg-orange-600",
  "bg-orange-700",
  "bg-orange-800",
  "bg-orange-900",
  "bg-orange-950",
  "border-orange-50",
  "border-orange-100",
  "border-orange-200",
  "border-orange-300",
  "border-orange-400",
  "border-orange-500",
  "border-orange-600",
  "border-orange-700",
  "border-orange-800",
  "border-orange-900",
  "border-orange-950",
  "bg-red-50",
  "bg-red-100",
  "bg-red-200",
  "bg-red-300",
  "bg-red-400",
  "bg-red-500",
  "bg-red-600",
  "bg-red-700",
  "bg-red-800",
  "bg-red-900",
  "bg-red-950",
  "border-red-50",
  "border-red-100",
  "border-red-200",
  "border-red-300",
  "border-red-400",
  "border-red-500",
  "border-red-600",
  "border-red-700",
  "border-red-800",
  "border-red-900",
  "border-red-950",
  "bg-slate-50",
  "bg-slate-100",
  "bg-slate-200",
  "bg-slate-300",
  "bg-slate-400",
  "bg-slate-500",
  "bg-slate-600",
  "bg-slate-700",
  "bg-slate-800",
  "bg-slate-900",
  "bg-slate-950",
  "border-slate-50",
  "border-slate-100",
  "border-slate-200",
  "border-slate-300",
  "border-slate-400",
  "border-slate-500",
  "border-slate-600",
  "border-slate-700",
  "border-slate-800",
  "border-slate-900",
  "border-slate-950",
];
