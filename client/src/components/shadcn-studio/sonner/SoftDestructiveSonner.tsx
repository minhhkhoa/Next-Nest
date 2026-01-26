"use client";

import { X } from "lucide-react";
import { toast } from "sonner";

const SoftDestructiveSonner = (message: string) => {
  return toast.error(message, {
    duration: 3000,
    action: {
      label: <X className="h-3.5 w-3.5" />,
      onClick: () => {},
    },
    style: {
      "--normal-bg":
        "color-mix(in oklab, var(--destructive) 10%, var(--background))",
      "--normal-text": "var(--destructive)",
      "--normal-border": "var(--destructive)",
    } as React.CSSProperties,
  });
};

export default SoftDestructiveSonner;
