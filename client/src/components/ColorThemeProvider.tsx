"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ColorThemeContext = createContext({
  colorTheme: "Default",
  setColorTheme: (theme: string) => {},
});

export function ColorThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorTheme, setColorTheme] = useState("Default");

  //- Load theme từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("color-theme");
    if (stored) setColorTheme(stored);
  }, []);

  //- Apply theme khi thay đổi
  useEffect(() => {
    document.documentElement.setAttribute("data-color-theme", colorTheme);
    localStorage.setItem("color-theme", colorTheme);
  }, [colorTheme]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  return useContext(ColorThemeContext);
}
