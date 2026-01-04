"use client";

import { toast } from "sonner";

const SoftDestructiveSonner = (message: string) => {
  return toast.error(message, {
    style: {
      "--normal-bg":
        "color-mix(in oklab, var(--destructive) 10%, var(--background))",
      "--normal-text": "var(--destructive)",
      "--normal-border": "var(--destructive)",
    } as React.CSSProperties,
  });
};

export default SoftDestructiveSonner;
