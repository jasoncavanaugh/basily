import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dbase_LowMid_Low: "hsla(277, 35%, 7%, 1)",
        dbase_Mid_Low: "hsla(277, 20%, 17%, 1)",
        dbase_LowLow_LowMid: "hsla(277, 33%, 25%, 1)",
        base_LowLow_HighHigh: "hsla(0, 4%, 90%)",
        zero_zero_HighHigh: "hsla(0, 6%, 96%)",
        mobileDarkDarkPurple: "#060208",
        mobileDarkPurple: "#181020",
        mobileTextViolet: "#d6bce8",
        mobileTextLightViolet: "#eedcf9",
        mobileTextMutedViolet: "#8d7891",
        mobileBtnViolet: "#362e3e",
        mobileBtnPurple: "#dc70d0",
        mobileTextBrightPurple: "#df6ccf",
        mobileBtnVioletHighlight: "#6c6776",

        togglLightBeige: "#fef9f7",
        togglDarkDarkPurple: "#220a2e",
        togglDarkPurple: "#2c1338",
        togglLightViolet: "#e57cd8",
        togglPeach: "#e87161",
        lightTogglPeach: "#fbe9e6",
        togglBtnGray: "#95899a",
      },
    },
  },
  plugins: [],
} satisfies Config;
