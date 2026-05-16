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
import { useCvScoreMutation } from "@/queries/useAi";
import { CvScoreResponseType } from "@/types/ai";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiScoreModalProps {
  cvId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiScoreModal({
  cvId,
  isOpen,
  onClose,
}: AiScoreModalProps) {
  const { mutate, isPending, data } = useCvScoreMutation();
  const [scoreData, setScoreData] = useState<CvScoreResponseType | null>(null);

  useEffect(() => {
    if (isOpen && cvId && !scoreData) {
      mutate({ cvId });
    }
  }, [isOpen, cvId, mutate]);

  useEffect(() => {
    if (data?.data) {
      setScoreData(data.data);
    }
  }, [data]);

  const handleClose = () => {
    setScoreData(null);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 border-green-500";
    if (score >= 50) return "text-yellow-500 border-yellow-500";
    return "text-red-500 border-red-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[1400px] h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="text-yellow-500 fill-yellow-500 h-6 w-6" />
            Phân tích CV chuyên sâu bằng AI
          </DialogTitle>
          <DialogDescription>
            AI đã phân tích nội dung CV của bạn. Dưới đây là kết quả đánh giá
            chi tiết.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">
              AI đang phân tích CV của bạn...
            </p>
          </div>
        ) : scoreData ? (
          <>
            {/* SCORE STRIP */}
            <div className="px-10 py-8 border-b bg-background">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Điểm đánh giá tổng thể
                  </p>
                  <div className="flex items-end gap-3">
                    <span
                      className={`text-6xl font-extrabold tracking-tight ${
                        getScoreColor(scoreData.score).split(" ")[0]
                      }`}
                    >
                      {scoreData.score}
                    </span>
                    <span className="text-xl text-muted-foreground mb-2">
                      /100
                    </span>
                  </div>
                </div>

                <div className="max-w-md">
                  <p className="text-muted-foreground leading-relaxed">
                    Điểm số này phản ánh mức độ rõ ràng, chuyên nghiệp và khả
                    năng gây ấn tượng với nhà tuyển dụng.
                  </p>
                </div>
              </div>
            </div>

            {/* SCROLL AREA */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-10 py-10 space-y-14">
                  {/* Strength & Weakness */}
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* Strengths */}
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold mb-6">
                        <CheckCircle2 className="text-green-500" />
                        Điểm mạnh
                      </h3>
                      <div className="space-y-4">
                        {scoreData.strengths.map((s, i) => (
                          <div
                            key={i}
                            className="flex gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10"
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                            <p className="text-sm leading-relaxed">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weakness */}
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold mb-6">
                        <XCircle className="text-red-500" />
                        Hạn chế
                      </h3>
                      <div className="space-y-4">
                        {scoreData.weaknesses.map((w, i) => (
                          <div
                            key={i}
                            className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                          >
                            <XCircle className="h-5 w-5 text-red-500 mt-1" />
                            <p className="text-sm leading-relaxed">{w}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions Timeline */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-8">
                      <Lightbulb className="text-primary" />
                      Lộ trình cải thiện CV
                    </h3>

                    <div className="relative border-l pl-8 space-y-8">
                      {scoreData.suggestions.map((s, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[17px] top-1 h-4 w-4 rounded-full bg-primary" />
                          <p className="font-medium mb-1">Bước {i + 1}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Có lỗi xảy ra khi tải dữ liệu.
          </div>
        )}

        <div className="p-6 border-t bg-muted/30 flex justify-end">
          <Button
            size="lg"
            onClick={handleClose}
            className="px-10 h-12 text-base font-bold shadow-lg shadow-primary/20"
          >
            Đã hiểu, cảm ơn AI!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
