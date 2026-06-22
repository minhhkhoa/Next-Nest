"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJdMatchMutation } from "@/queries/useAi";
import { JdMatchResponseType } from "@/types/ai";
import {
  CheckCircle2,
  XCircle,
  FileSearch,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";

interface AiMatchModalProps {
  cvId: string | null;
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiMatchModal({
  cvId,
  jobId,
  isOpen,
  onClose,
}: AiMatchModalProps) {
  const t = useTranslations("AiMatchModal");
  const tCommon = useTranslations("Common");
  const { mutate, isPending, data } = useJdMatchMutation();
  const [matchData, setMatchData] = useState<JdMatchResponseType | null>(null);

  useEffect(() => {
    if (isOpen && cvId && jobId && !matchData) {
      mutate({ cvId, jobId });
    }
  }, [isOpen, cvId, jobId, mutate, matchData]);

  useEffect(() => {
    if (data?.data) {
      setMatchData(data.data);
    }
  }, [data]);

  const handleClose = () => {
    setMatchData(null);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 border-green-500";
    if (score >= 60) return "text-blue-500 border-blue-500";
    if (score >= 40) return "text-yellow-500 border-yellow-500";
    return "text-red-500 border-red-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[1000px] h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2 font-bold">
            <Sparkles className="text-purple-500 fill-purple-500 h-6 w-6" />
            {t("Title")}
          </DialogTitle>
          <DialogDescription>
            {t("Description")}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-muted/5">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <Target className="h-6 w-6 text-primary absolute inset-0 m-auto" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg animate-pulse">
                {t("Analyzing")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("PleaseWait")}
              </p>
            </div>
          </div>
        ) : matchData ? (
          /* FIX: Thay Fragment bằng div có flex-col và overflow-hidden để cố định layout */
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* MATCH SCORE SECTION */}
            <div className="p-4 border-b bg-gradient-to-r from-background to-muted/20 shrink-0">
              <div className="flex flex-col gap-4 items-center w-full">
                {/* Khối Điểm số: Gọn hơn */}
                <div className="flex items-center justify-center gap-6 w-full max-w-md">
                  <div
                    className={`h-16 w-16 rounded-full border-4 flex items-center justify-center bg-background shadow-lg shrink-0 ${getScoreColor(matchData.match_score)}`}
                  >
                    <div className="text-center flex">
                      <span className="text-xl font-black">
                        {matchData.match_score}
                      </span>
                      <span className="text-[18px] block font-bold uppercase mt-0.5">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-lg font-bold leading-tight">
                      {t("Compatibility")}
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                      {t("AnalysisBase")}
                    </p>
                  </div>
                </div>

                {/* Khối Nhận xét: Tối ưu chiều cao */}
                <div className="flex flex-col gap-1.5 w-full max-w-2xl">
                  <h5 className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                    <FileSearch className="w-3.5 h-3.5" /> {t("OverviewComments")}
                  </h5>
                  <div className="w-full bg-background/50 p-3 rounded-xl border border-border shadow-sm flex flex-col">
                    <ScrollArea className="h-[60px] w-full">
                      <p className="text-xs leading-relaxed text-foreground/80 italic pr-4">
                        {matchData.notes}
                      </p>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>

            {/* SKILLS ANALYSIS */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-8 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Matched Skills */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-bold text-green-600 bg-green-500/10 w-fit px-3 py-1 rounded-full text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("MatchedSkills")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {matchData.matched_skills.length > 0 ? (
                          matchData.matched_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-green-500/5 text-green-700 border border-green-500/20 rounded-lg text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            {t("NoMatchedSkills")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-bold text-red-600 bg-red-500/10 w-fit px-3 py-1 rounded-full text-sm">
                        <XCircle className="h-4 w-4" />
                        {t("MissingSkills")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {matchData.missing_skills.length > 0 ? (
                          matchData.missing_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-red-500/5 text-red-700 border border-red-500/20 rounded-lg text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            {t("AllSkillsMatched")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
            <XCircle className="h-12 w-12 mb-4 text-destructive opacity-50" />
            <p className="text-lg font-medium text-foreground">
              {t("ErrorTitle")}
            </p>
            <p className="text-sm">
              {t("ErrorDesc")}
            </p>
          </div>
        )}

        <div className="p-4 border-t bg-muted/20 flex justify-end shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-8 font-semibold"
          >
            {tCommon("Buttons.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
