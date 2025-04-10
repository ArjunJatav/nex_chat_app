import { createContext } from "react";
import { COLORS } from "../Colors/Colors";
const ThemeContext = createContext();
export default ThemeContext;
export const SettingThemeTop = () => {
  return {
    TopImage:
      globalThis.selectTheme === "newYear"
        ? COLORS.white
        : globalThis.selectTheme === "christmas"
        ? COLORS.white
        : globalThis.selectTheme == "third"
        ? COLORS.dark_pink
        : globalThis.selectTheme == "second"
        ? COLORS.primary_blue
        : COLORS.purple,
  };
};
