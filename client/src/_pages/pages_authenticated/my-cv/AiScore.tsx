"use client";

import React, { useEffect, useState } from "react";
import { useCvScoreMutation } from "@/queries/useAi";
import { CvScoreResponseType } from "@/types/ai";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getIdFromSlugUrl } from "@/lib/utils";

import { useTranslations } from "next-intl";
import { useGetLang } from "@/hooks/use-get-lang";

interface AiScorePageProps {
  id: string;
}

const AI_TIPS_VI = [
  "Hãy sử dụng các động từ hành động mạnh mẽ như 'Đã dẫn dắt', 'Đạt được', 'Tối ưu hóa' để mô tả kinh nghiệm làm việc.",
  "Đặt các từ khóa kỹ năng quan trọng lên phần đầu của CV để hệ thống lọc tự động (ATS) dễ dàng nhận diện hơn.",
  "Tránh đưa các thông tin quá cá nhân không cần thiết như chiều cao, cân nặng hoặc tình trạng hôn nhân vào CV chuyên nghiệp.",
  "Luôn định dạng và xuất CV dưới dạng file PDF để tránh lỗi hiển thị bố cục hoặc phông chữ khi nhà tuyển dụng mở.",
  "Mỗi kinh nghiệm làm việc nên đi kèm số liệu cụ thể (ví dụ: 'tăng 20% doanh thu', 'giảm 15% thời gian xử lý').",
];

const AI_TIPS_EN = [
  "Use strong action verbs like 'Led', 'Achieved', 'Optimized' to describe your work experience.",
  "Place key skill keywords at the top of your CV for ATS to easily scan.",
  "Avoid unnecessary personal information like height, weight, or marital status in a professional CV.",
  "Always format and export your CV as a PDF to avoid layout or font issues when opened.",
  "Each work experience should include specific data (e.g., 'increased sales by 20%', 'reduced processing time by 15%').",
];

const LOADING_STEPS_VI = [
  "Đang thiết lập kết nối an toàn với máy chủ AI...",
  "Đọc và phân tích cấu trúc dữ liệu CV...",
  "Trích xuất các thông tin kỹ năng, học vấn và kinh nghiệm...",
  "Đối chiếu với bộ tiêu chuẩn đánh giá CV ngành nghề hiện tại...",
  "Đang tính toán điểm số tổng hợp và phân tích ưu/nhược điểm...",
  "Đang tổng hợp lộ trình cải thiện CV tối ưu nhất cho bạn...",
];

const LOADING_STEPS_EN = [
  "Establishing secure connection to AI server...",
  "Reading and analyzing CV structure...",
  "Extracting skills, education, and experience...",
  "Benchmarking with current industry CV standards...",
  "Calculating overall score and analyzing strengths/weaknesses...",
  "Synthesizing the best CV improvement roadmap for you...",
];

export default function PageAiScore({ id }: AiScorePageProps) {
  const t = useTranslations("AiScorePage");
  const { locale } = useGetLang();

  const aiTips = locale === "en" ? AI_TIPS_EN : AI_TIPS_VI;
  const loadingSteps = locale === "en" ? LOADING_STEPS_EN : LOADING_STEPS_VI;

  const cvId = getIdFromSlugUrl(id);
  const { mutate, isPending, data, error } = useCvScoreMutation();
  const [scoreData, setScoreData] = useState<CvScoreResponseType | null>(null);

  //- State cho hiệu ứng loading giả lập
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  //- Kích hoạt gọi API chấm điểm khi load trang (ưu tiên đọc từ cache sessionStorage)
  useEffect(() => {
    if (cvId) {
      const cached = sessionStorage.getItem(`ai_score_${cvId}`);
      if (cached) {
        try {
          setScoreData(JSON.parse(cached));
        } catch {
          mutate({ cvId });
        }
      } else {
        mutate({ cvId });
      }
    }
  }, [cvId, mutate]);

  //- Lưu dữ liệu phản hồi từ AI vào state và cache
  useEffect(() => {
    if (data?.data && cvId) {
      setScoreData(data.data);
      sessionStorage.setItem(`ai_score_${cvId}`, JSON.stringify(data.data));
    }
  }, [data, cvId]);

  //- Hàm yêu cầu chấm điểm lại (xoá cache và gọi API mới)
  const handleReevaluate = () => {
    if (cvId) {
      sessionStorage.removeItem(`ai_score_${cvId}`);
      setScoreData(null);
      setCurrentStepIndex(0);
      mutate({ cvId });
    }
  };

  //- Hiệu ứng chuyển bước loading giả lập để tạo trải nghiệm sinh động
  useEffect(() => {
    if (!isPending) return;

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 3500);

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % aiTips.length);
    }, 6000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [isPending, loadingSteps.length, aiTips.length]);

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
    if (score >= 50) return "text-amber-500 border-amber-500 bg-amber-500/10";
    return "text-rose-500 border-rose-500 bg-rose-500/10";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return t("ExcellentDesc");
    if (score >= 50) return t("GoodDesc");
    return t("NeedsImprovementDesc");
  };

  //- Render màn hình Loading
  if (isPending) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="w-full max-w-2xl text-center space-y-10">
          {/* AI Pulsing Orb */}
          <div className="relative flex items-center justify-center mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary to-violet-500 opacity-40 blur-lg animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-card border border-primary/20 flex items-center justify-center shadow-2xl">
              <Sparkles className="h-10 w-10 text-primary animate-bounce" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              {t("Analyzing")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("AnalyzingDesc")}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">
                  {t("Progress")}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(
                    ((currentStepIndex + 1) / loadingSteps.length) * 100,
                  )}
                  %
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-violet-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${((currentStepIndex + 1) / loadingSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center min-h-[40px] px-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground transition-all duration-300">
                {loadingSteps[currentStepIndex]}
              </span>
            </div>
          </div>

          {/* Dynamic AI CV Tip */}
          <div className="p-5 rounded-xl border border-dashed bg-muted/30 max-w-lg mx-auto">
            <div className="flex items-start gap-3 text-left">
              <Lightbulb className="h-5 w-5 text-amber-500 fill-amber-500/20 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {t("ExpertTip")}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed transition-all duration-500">
                  {aiTips[currentTipIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //- Render màn hình báo lỗi
  if (error || (!isPending && !scoreData)) {
    return (
      <div className="container max-w-xl mx-auto py-24 px-4 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
          <XCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">{t("ErrorTitle")}</h2>
        <p className="text-muted-foreground">{t("ErrorDesc")}</p>
        <div className="flex gap-4 justify-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/my-cv">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("BackToList")}
            </Link>
          </Button>
          <Button onClick={() => mutate({ cvId })}>{t("Retry")}</Button>
        </div>
      </div>
    );
  }

  //- Render màn hình Kết quả chấm điểm CV
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8 mb-8">
        <div className="space-y-1.5">
          <Link
            href="/my-cv"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("BackToList")}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {t("ResultTitle")}
            </h1>
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20">
              <Sparkles className="h-3 w-3 fill-primary/10" />
              {t("AiEngine")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {t("AutoAnalyzeDesc")}
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            size="lg"
            className="h-11 font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            onClick={handleReevaluate}
            disabled={isPending}
          >
            <Sparkles className="mr-2 h-4 w-4 text-amber-500 fill-amber-500/20 animate-pulse" />
            {t("Reevaluate")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 font-medium"
            asChild
          >
            <Link href={`/my-cv/${id}?edit=true`}>
              <FileCheck className="mr-2 h-4.5 w-4.5 text-muted-foreground" />
              {t("ViewEdit")}
            </Link>
          </Button>
        </div>
      </div>

      {/* DASHBOARD GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL - SCORE OVERVIEW */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border rounded-2xl p-8 shadow-sm text-center relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-6">
              {t("OverallScore")}
            </span>

            {/* Premium Circle Progress */}
            <div className="relative inline-flex items-center justify-center mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-violet-600 opacity-20 blur-md group-hover:opacity-30 transition-opacity" />

              {/* Vòng tròn điểm SVG */}
              <svg className="w-44 h-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className="stroke-muted"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className="stroke-primary transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 74}
                  strokeDashoffset={
                    2 * Math.PI * 74 * (1 - (scoreData?.score || 0) / 100)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              {/* Điểm ở giữa */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tighter text-foreground">
                  {scoreData?.score}
                </span>
                <span className="text-sm font-semibold text-muted-foreground mt-0.5">
                  {t("ScoreUnit")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${getScoreColor(scoreData?.score || 0)}`}
              >
                {scoreData?.score && scoreData.score >= 80
                  ? t("Excellent")
                  : scoreData?.score && scoreData.score >= 50
                    ? t("Good")
                    : t("NeedsImprovement")}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed px-2 font-medium">
                {getScoreDescription(scoreData?.score || 0)}
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold flex items-center gap-2 border-b pb-3">
              <TrendingUp className="text-primary h-4.5 w-4.5" />
              {t("MetricAnalysis")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("AtsPass")}</span>
                <span className="font-semibold text-foreground">
                  {scoreData?.score && scoreData.score >= 80
                    ? t("AtsHigh")
                    : scoreData?.score && scoreData.score >= 50
                      ? t("AtsMedium")
                      : t("AtsLow")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("ClarityLayout")}
                </span>
                <span className="font-semibold text-foreground">
                  {t("Stable")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("Persuasiveness")}
                </span>
                <span className="font-semibold text-foreground">
                  {scoreData?.score && scoreData.score >= 70
                    ? t("Persuasive")
                    : t("NeedsData")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - DETAILED REPORT */}
        <div className="lg:col-span-8 space-y-8">
          {/* STRENGTHS & WEAKNESSES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STRENGTHS CARD */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-600 dark:text-emerald-500 border-b pb-4 mb-4">
                <CheckCircle2 className="h-5 w-5 fill-emerald-100 dark:fill-emerald-950" />
                {t("Strengths", { count: scoreData?.strengths.length || 0 })}
              </h3>
              <div className="space-y-3 flex-1">
                {scoreData?.strengths && scoreData.strengths.length > 0 ? (
                  scoreData.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3.5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200"
                    >
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        {strength}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    {t("StrengthsEmpty")}
                  </p>
                )}
              </div>
            </div>

            {/* WEAKNESSES CARD */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <h3 className="flex items-center gap-2 text-lg font-bold text-rose-600 dark:text-rose-500 border-b pb-4 mb-4">
                <XCircle className="h-5 w-5 fill-rose-100 dark:fill-rose-950" />
                {t("Weaknesses", { count: scoreData?.weaknesses.length || 0 })}
              </h3>
              <div className="space-y-3 flex-1">
                {scoreData?.weaknesses && scoreData.weaknesses.length > 0 ? (
                  scoreData.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3.5 rounded-xl bg-rose-500/[0.03] border border-rose-500/10 hover:border-rose-500/20 transition-all duration-200"
                    >
                      <div className="h-5 w-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                        {weakness}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    {t("WeaknessesEmpty")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* TIMELINE IMPROVEMENT SUGGESTIONS */}
          <div className="bg-card border rounded-2xl p-8 mb-2 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="flex items-center gap-2 text-xl font-bold border-b pb-5 mb-8">
              <Lightbulb className="text-amber-500 fill-amber-500/10 h-6 w-6" />
              {t("ImprovementPath")}
            </h3>

            <div className="relative border-l-2 border-primary/20 pl-6 md:pl-8 ml-3 md:ml-4 space-y-10 py-2">
              {scoreData?.suggestions && scoreData.suggestions.length > 0 ? (
                scoreData.suggestions.map((suggestion, index) => (
                  <div key={index} className="relative group/step">
                    {/* Circle marker on line */}
                    <div className="absolute -left-[35px] md:-left-[43px] top-1.5 h-6 w-6 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-sm group-hover/step:bg-primary transition-colors">
                      <span className="text-[10px] font-bold text-primary group-hover/step:text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-foreground group-hover/step:text-primary transition-colors flex items-center gap-2">
                        {t("StepAction", { step: index + 1 })}
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover/step:opacity-100 group-hover/step:translate-x-1 transition-all" />
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic pl-2">
                  {t("SuggestionsEmpty")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
