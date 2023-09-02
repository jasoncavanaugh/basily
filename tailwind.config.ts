import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        //light -> Pokemon
        charmander: "hsla(0, 4%, 90%, 1)",
        pikachu: "hsla(0, 6%, 96%, 1)",
        bulbasaur: "hsla(40, 50%, 98%, 1)",
        //dark -> League of Legends
        khazix: "hsla(277, 35%, 7%, 1)",
        leblanc: "hsla(277, 20%, 17%, 1)",
        shaco: "hsla(277, 33%, 25%, 1)",
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
