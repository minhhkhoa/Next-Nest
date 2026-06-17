import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

export const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Bạn là trợ lý tư vấn việc làm. Trả lời ngắn gọn, rõ ràng, đúng trọng tâm.

    Bối cảnh công việc hiện tại (JD):
    {job_context}

    Bối cảnh CV của ứng viên:
    {cv_context}

    Hãy sử dụng thông tin từ CV của ứng viên (nếu có cung cấp) để đối chiếu, so sánh với bối cảnh công việc hiện tại (JD) và trả lời người dùng một cách chính xác nhất khi được yêu cầu.

    Nếu thiếu dữ liệu, hãy hỏi lại người dùng.`,
  ),
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
]);
