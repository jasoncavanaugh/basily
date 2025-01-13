import {
  COLOR_VALUES,
  BASE_COLORS,
  BASE_COLOR_PREFIXES,
  BaseColorPrefixes,
  BaseColor,
  ColorValue,
} from "./tailwind-colors";
import * as fs from "fs";
//This is for generating the map that we use to access Tailwind colors
const mp: {
  [key in BaseColorPrefixes]?: {
    [key in BaseColor]?: { [key in ColorValue]?: string };
  };
} = {};
//const mp = {};
for (const pr of BASE_COLOR_PREFIXES) {
  mp[pr] = {};
  for (const color of BASE_COLORS) {
    //mp[pr][color] = {};
    mp[pr]![color] = {};
    for (const value of COLOR_VALUES) {
      const class_name = `${pr}-${color}-${value}`;
      //mp[pr][color][value] = class_name;
      mp[pr]![color]![value] = class_name;
    }
  }
}

//const b = mp["bg"];

const content = `export const TW_COLORS_MP = ${JSON.stringify(mp)} as const`;
//console.log(`export const TW_COLORS_MP = ${JSON.stringify(mp)} as const`);
fs.writeFile("./src/utils/tailwindColorsMp.ts", content, (err) => {});
