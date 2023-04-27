import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lightBeige: "#fef9f7",
        darkDarkPurple: "#220a2e",
        darkPurple: "#2c1338",
        lightViolet: "#e57cd8",
        togglPeach: "#e87161",
        lightTogglPeach: "#fbe9e6",
        togglBtnGray: "#95899a",
      },
    },
  },
  plugins: [],
} satisfies Config;
