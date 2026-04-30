"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "error" | "warning" | "info";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: StatusType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  description,
  actionLabel,
  onAction,
}: StatusModalProps) {
  const configs = {
    success: {
      icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    error: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    warning: {
      icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    info: {
      icon: <Info className="w-16 h-16 text-blue-500" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  };

  const config = configs[type];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="flex flex-col items-center justify-center pt-6 pb-2 space-y-4">
          <div className={cn("p-4 rounded-full", config.bgColor)}>
            {config.icon}
          </div>
          
          <DialogHeader>
            <DialogTitle className={cn("text-2xl font-bold text-center", config.color)}>
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          {actionLabel && (
            <Button 
              onClick={() => {
                onAction?.();
                onClose();
              }}
              className="w-full sm:w-auto"
            >
              {actionLabel}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
