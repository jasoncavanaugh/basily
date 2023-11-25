// @ts-nocheck
import {
  COLOR_VALUES,
  BASE_COLORS,
  BASE_COLOR_PREFIXES,
  BaseColorPrefixes,
  BaseColor,
  ColorValue,
} from "./colors";
import { colors } from "./jason";
import * as fs from "fs";
//This is for generating the map that we use to access Tailwind colors
const mp: {
  [key in BaseColor]?: { [key in ColorValue]?: string };
} = {};

for (const base of BASE_COLORS) {
  for (const val of COLOR_VALUES) {
    const target = `${base}-${val}`;
    if (colors[target]) {
      if (!mp[base]) {
        mp[base] = {};
      }
      mp[base]![val] = colors[target];
    }
  }
}

console.log(mp);

const content = `export const TW_COLORS_TO_HEX_MP = ${JSON.stringify(
  mp
)} as const`;
//console.log(`export const TW_COLORS_MP = ${JSON.stringify(mp)} as const`);
fs.writeFile("./tailwindColorsToHexMp.ts", content, (err) => {});
