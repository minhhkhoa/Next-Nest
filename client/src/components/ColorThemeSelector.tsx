"use client";

import { Button } from "@/components/ui/button";
import { useColorTheme } from "./ColorThemeProvider";

const THEMES = [
  "Default",
  "Red",
  "Rose",
  "Orange",
  "Blue",
  "Green",
  "Yellow",
  "Violet",
];

export default function ColorThemeSelector() {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <div className="flex flex-wrap gap-2 pb-3">
      {THEMES.map((theme) => (
        <Button
          className="p-3"
          key={theme}
          onClick={() => setColorTheme(theme)}
          variant={colorTheme === theme ? "default" : "outline"}
        >
          {theme}
        </Button>
      ))}
    </div>
  );
}
