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
  const [isMounted, setIsMounted] = useState(false);

  //- Load theme từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("color-theme");
    if (stored) {
      setColorTheme(stored);
    }
    setIsMounted(true);
  }, []);

  //- Apply theme khi thay đổi
  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.setAttribute("data-color-theme", colorTheme);
    localStorage.setItem("color-theme", colorTheme); // Chỉ lưu khi đã mount xong để tránh ghi đè "Default"
  }, [colorTheme, isMounted]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  return useContext(ColorThemeContext);
}
