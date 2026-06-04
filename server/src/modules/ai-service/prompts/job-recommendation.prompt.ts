import { ChatPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

//- prompt template dùng để trích xuất thông tin hồ sơ/cv người dùng thành các tiêu chí tìm kiếm việc làm
export const jobRecommendationPromptTemplate = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Bạn là chuyên viên tuyển dụng AI. Dựa trên thông tin hồ sơ cá nhân và CV của người tìm việc, hãy trích xuất các tiêu chí tìm kiếm công việc phù hợp nhất với họ dưới dạng JSON.
      
      Các giá trị cấp bậc (level) hợp lệ là: 'intern', 'fresher', 'junior', 'middle', 'senior', 'lead' (hãy ánh xạ trình độ của ứng viên sang một trong các giá trị này).
      Các địa điểm (location) thường gặp ở Việt Nam: 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', v.v.

      Trả về JSON hợp lệ theo cấu trúc sau:
      {{
        "titleKeywords": ["Các từ khóa tiêu đề công việc chính để tìm kiếm rộng hơn, ví dụ: React, Frontend, Developer, NodeJS, Javascript, Sales"],
        "skills": ["Các kỹ năng quan trọng của ứng viên để tìm kiếm, ví dụ: React, Java, NodeJS, Excel"],
        "level": "intern hoặc fresher hoặc junior hoặc middle hoặc senior hoặc lead",
        "location": "Tỉnh thành mong muốn làm việc (nếu có, hoặc trống)"
      }}
      Chỉ trả về JSON, không thêm giải thích ngoài JSON.`,
  ),
  ['human', 'Thông tin ứng viên:\n{profile_context}'],
]);
