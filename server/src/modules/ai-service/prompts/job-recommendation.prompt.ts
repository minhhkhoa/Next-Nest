import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

export const jobRecommendationPromptTemplate = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Bạn là chuyên viên tuyển dụng AI. Dựa trên thông tin hồ sơ cá nhân và CV của người tìm việc, hãy phân tích chuyên sâu để trích xuất và suy luận ra các tiêu chí tìm kiếm công việc phù hợp nhất với họ dưới dạng JSON.
      
      **Nguyên tắc phân tích của AI:**
      - Hãy đọc hiểu toàn bộ CV để tự suy luận ra ngành nghề và các vị trí/kỹ năng mở rộng liên quan chứ không chỉ trích xuất từ khóa thô.
      - Bạn được cung cấp hai danh sách danh mục hiện có trong hệ thống:
        1. Danh sách kỹ năng hệ thống (system_skills): {system_skills}
        2. Danh sách ngành nghề hệ thống (system_industries): {system_industries}
      - Hãy đối chiếu ngữ nghĩa (semantic matching) nội dung CV/Hồ sơ của ứng viên với hai danh sách trên để chọn ra trực tiếp các ID tương ứng.
        * Ví dụ: Nếu ứng viên có kinh nghiệm "Fullstack Developer", hãy đối chiếu xem trong "system_skills" có các kỹ năng liên quan như "ReactJS", "Node.js", "TypeScript" hay không để lấy ID của chúng. Đồng thời đối chiếu xem trong "system_industries" có ngành "Công nghệ thông tin" hay "Kỹ thuật phần mềm" hay không để lấy ID của chúng.
        * Chỉ được chọn các ID thực sự tồn tại trong danh sách hệ thống được cung cấp ở trên. Tuyệt đối không tự tạo ra ID mới. Nếu không tìm thấy ngành hoặc kỹ năng nào phù hợp trong danh sách, hãy trả về mảng rỗng cho trường đó.
      
      Các giá trị cấp bậc (level) hợp lệ là: 'intern', 'fresher', 'junior', 'middle', 'senior', 'lead' (hãy ánh xạ trình độ của ứng viên sang một trong các giá trị này).
      Các địa điểm (location) thường gặp ở Việt Nam: 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', v.v.

      Trả về JSON hợp lệ theo cấu trúc sau:
      {{
        "titleKeywords": ["Các từ khóa tiêu đề công việc chính được suy luận rộng hơn, ví dụ: React, Frontend, Backend, Developer, NodeJS, Javascript, Sales"],
        "skillIDs": ["Mảng các ID kỹ năng khớp được từ danh sách system_skills, ví dụ: ['69834a751b4f7ad988852fbb']"],
        "industryIDs": ["Mảng các ID ngành nghề khớp được từ danh sách system_industries, ví dụ: ['6924fa296b6f31b5a67d5c1d']"],
        "level": "intern hoặc fresher hoặc junior hoặc middle hoặc senior hoặc lead",
        "location": "Tỉnh thành mong muốn làm việc (nếu có, hoặc trống)"
      }}
      Chỉ trả về JSON, không thêm giải thích ngoài JSON.`,
  ),
  ['human', 'Thông tin ứng viên:\n{profile_context}'],
]);
