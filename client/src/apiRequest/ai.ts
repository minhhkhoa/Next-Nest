import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";
import { AiChatResponseType, CvScoreResponseType, JdMatchResponseType } from "@/types/ai";

const prefix = "/ai";

const aiApiRequest = {
  cvScore: (body: { cvId: string }) =>
    http.post<ApiResponse<CvScoreResponseType>>(`${prefix}/cv-score`, body, {
      timeout: 60000,
    }),

  jdMatch: (body: { cvId: string; jobId: string }) =>
    http.post<ApiResponse<JdMatchResponseType>>(`${prefix}/jd-match`, body, {
      timeout: 60000,
    }),

  chat: (body: { message: string; jobId: string }) =>
    http.post<ApiResponse<AiChatResponseType>>(`${prefix}/chat`, body, {
      timeout: 60000,
    }),

  getChatHistory: () =>
    http.get<ApiResponse<any>>(`${prefix}/chat/history`),

  getRecommendJobs: (force = false) =>
    http.get<ApiResponse<any>>(`${prefix}/recommend-jobs${force ? '?force=true' : ''}`, {
      timeout: 60000,
    }),
};

export default aiApiRequest;
