
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
import { useTranslations } from "next-intl";

interface SaveResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeName: string;
  onResumeNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  showTrigger?: boolean;
}

export function SaveResumeDialog({
  open,
  onOpenChange,
  resumeName,
  onResumeNameChange,
  onSave,
  isSaving,
  showTrigger = true,
}: SaveResumeDialogProps) {
  const t = useTranslations("Candidate.MyCv.SaveResumeDialog");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex justify-end mt-6 print:hidden">
      <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg min-w-[200px]">
              <Save className="mr-2 h-4 w-4" />
              {t("BtnTrigger")}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Title")}</DialogTitle>
            <DialogDescription>
              {t("Description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="resumeName"
                value={resumeName}
                onChange={(e) => onResumeNameChange(e.target.value)}
                placeholder={t("Placeholder")}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {tCommon("Buttons.cancel")}
            </Button>
            <Button type="button" onClick={onSave} disabled={isSaving}>
              {isSaving ? t("Saving") : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
