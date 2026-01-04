"use client";

import { toast } from "sonner";

const SoftWarningSonner = (message: string) => {
  return toast.warning(message, {
    style: {
      "--normal-bg":
        "color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))",
      "--normal-text":
        "light-dark(var(--color-amber-600), var(--color-amber-400))",
      "--normal-border":
        "light-dark(var(--color-amber-600), var(--color-amber-400))",
    } as React.CSSProperties,
  });
};

export default SoftWarningSonner;
