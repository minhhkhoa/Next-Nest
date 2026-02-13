
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

interface SaveResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeName: string;
  onResumeNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SaveResumeDialog({
  open,
  onOpenChange,
  resumeName,
  onResumeNameChange,
  onSave,
  isSaving,
}: SaveResumeDialogProps) {
  return (
    <div className="flex justify-end mt-6 print:hidden">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg min-w-[200px]">
            <Save className="mr-2 h-4 w-4" />
            Lưu hồ sơ CV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lưu hồ sơ CV</DialogTitle>
            <DialogDescription>
              Đặt tên cho CV của bạn để dễ dàng tìm kiếm lại sau này.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="resumeName"
                value={resumeName}
                onChange={(e) => onResumeNameChange(e.target.value)}
                placeholder="Nhập tên CV..."
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="button" onClick={onSave} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
