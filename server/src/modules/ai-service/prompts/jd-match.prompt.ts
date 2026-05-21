import { ChatPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

export const jdMatchPromptTemplate = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Bạn là chuyên viên tuyển dụng. Hãy so sánh CV với JD.
      Trả về JSON hợp lệ theo cấu trúc:
        {{
          "match_score": 0,
          "matched_skills": ["..."],
          "missing_skills": ["..."],
          "notes": "..."
        }}
    Chỉ trả về JSON, không thêm giải thích ngoài JSON.`,
  ),
  [
    'human',
    'JD (mô tả công việc):\n{job_context}\n\nCV (ứng viên):\n{cv_context}',
  ],
]);
