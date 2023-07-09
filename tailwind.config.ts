import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
