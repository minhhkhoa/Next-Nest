"use client";

import { X } from "lucide-react";
import { toast } from "sonner";

const SoftInfoSonner = (message: string) => {
  return toast.success(message, {
    duration: 3000,
    action: {
      label: <X className="h-3.5 w-3.5" />,
      onClick: () => {},
    },
    style: {
      "--normal-bg":
        "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
      "--normal-text":
        "light-dark(var(--color-green-600), var(--color-green-400))",
      "--normal-border":
        "light-dark(var(--color-green-600), var(--color-green-400))",
    } as React.CSSProperties,
  });
};

export default SoftInfoSonner;
