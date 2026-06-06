# AI Architecture - Gemini + LangChain + NestJS

## Mục tiêu

Tài liệu này mô tả kiến trúc và cách triển khai 3 tính năng:

1. Chatbot (hỏi đáp về job, tư vấn ứng viên)
2. Chấm CV (đánh giá chất lượng CV của ứng viên)
3. Chấm độ chính xác khớp giữa CV và JD

Ưu tiên: đơn giản, dễ mở rộng, tiết kiệm token (Gemini free). Không lưu lịch sử chat cũ khi chuyển job.

## Tổng quan kiến trúc (dựa trên bài hướng dẫn)

Luồng xử lý tổng quát:

- Client -> NestJS Controller -> AgentService
- AgentService sử dụng LangChain (prompt, memory) và gọi Gemini LLM
- Gemini trả kết quả -> AgentService -> Controller -> Client

Thành phần chính:

- Controller: nhận request, validate, chuyển tới service
- AgentService: logic AI, prompt, memory, tools
- LangChain: prompt template, agent executor, tool calling
- Gemini: LLM backend

## Phân tách module để mở rộng

Đề nghị cấu trúc (mang tính định hướng):

src/
ai/
langchain.module.ts
gemini-chat.provider.ts
agents/
chat-agent.service.ts
scoring-agent.service.ts
matching-agent.service.ts
prompts/
chat.prompt.ts
cv-scoring.prompt.ts
jd-match.prompt.ts
tools/
get-job-context.tool.ts
get-cv-context.tool.ts
app.controller.ts
app.module.ts

## Thiết kế chung cho Gemini + LangChain

### 1) Gemini provider

- Cung cấp BaseChatModel thông qua NestJS provider
- Lấy GEMINI_API_KEY từ .env

### 2) Prompt template

- Tách prompt ra file riêng
- Nhúng biến động: job_context, cv_context, user_input
- Đảm bảo prompt rõ ràng, ngắn gọn

### 3) Memory

- Dùng BufferMemory trong chat
- Khi đổi job: reset memory và nạp job context mới
- Không lưu chat cũ (hoặc lưu ít cho UI, không gửi LLM)

## Tính năng 1: Chatbot

### Mục tiêu

- Trả lời câu hỏi liên quan đến job đang xem
- Không bị lẫn ngữ cảnh khi chuyển job

### Luồng xử lý

1. UI gọi /ai/chat?jobId=...&question=...
2. Service lấy job_context (tóm tắt thông tin job)
3. Reset memory nếu jobId mới
4. Tạo prompt: system + job_context + question
5. Gọi Gemini
6. Trả lời về client

### Gợi ý prompt (tóm tắt)

- System: bạn là trợ lý tư vấn việc làm, trả lời ngắn gọn, rõ ràng
- Job context: title, company, level, location, salary, requirements
- User input

## Tính năng 2: Chấm CV (đánh giá CV ứng viên)

### Mục tiêu

- Đánh giá chất lượng CV (điểm số, nhận xét)
- Tập trung vào kỹ năng, kinh nghiệm, trình bày, phù hợp nghề nghiệp

### Luồng xử lý

1. UI gọi /ai/cv-score?cvId=...
2. Service lấy cv_context (nội dung CV đã tiền xử lý)
3. Tạo prompt đánh giá CV
4. Gọi Gemini
5. Trả kết quả: điểm + nhận xét + gợi ý cải thiện

### Output đề nghị

- score: 0-100
- strengths: list
- weaknesses: list
- suggestions: list

## Tính năng 3: Chấm độ khớp CV và JD

### Mục tiêu

- Đánh giá mức độ phù hợp giữa CV và job description (JD)
- Trả về điểm + lý do chính

### Luồng xử lý

1. UI gọi /ai/jd-match?cvId=...&jobId=...
2. Service lấy cv_context và job_context
3. Tạo prompt so sánh CV vs JD
4. Gọi Gemini
5. Trả kết quả: match_score + missing_skills + highlights

### Output đề nghị

- match_score: 0-100
- matched_skills: list
- missing_skills: list
- notes: short text

## Chi tiết triển khai theo hướng dẫn

### 1) Langchain module và Gemini provider

- Tạo provider GEMINI_CHAT_MODEL (ChatGoogleGenerativeAI)
- Đăng ký vào LangchainModule
- Import LangchainModule vào AppModule

### 2) Chat agent service (chat-agent.service.ts)

- Inject BaseChatModel
- Dùng BufferMemory
- Lưu biến current_job_id (in-memory hoặc cache)
- Khi jobId mới: reset memory
- Prompt template: chat.prompt.ts

Pseudo-flow:

- if jobId != current_job_id:
  - memory.clear()
  - current_job_id = jobId
- system prompt + job_context + user_input
- llm.invoke()

### 3) CV scoring service (scoring-agent.service.ts)

- Không cần memory
- Gọi prompt cv-scoring.prompt.ts
- llm.invoke() -> parse kết quả theo JSON

### 4) JD matching service (matching-agent.service.ts)

- Không cần memory
- Gọi prompt jd-match.prompt.ts
- llm.invoke() -> parse kết quả theo JSON

### 5) Job recommendation service (job-recommendation.service.ts)

- **Cơ chế hoạt động**: Không cần memory trong luồng chat. Dữ liệu được lưu cache và tính toán nền để tối ưu hiệu năng.
- **Quy trình trích xuất & So khớp**:
  - Khi cần tính toán, service tập hợp ngữ cảnh từ `DetailProfile` và tất cả các `UserResume` (CV) thành chuỗi thông tin ứng viên.
  - Lấy danh sách kỹ năng và ngành nghề dạng phẳng từ cơ sở dữ liệu và gửi kèm lên LLM.
  - Gọi prompt `job-recommendation.prompt.ts` để nhờ Gemini đối chiếu ngữ nghĩa và trích xuất trực tiếp mã `skillIDs` và `industryIDs` chuẩn có sẵn trong hệ thống (loại bỏ bước ánh xạ thủ công ở backend).
  - Gộp ID kỹ năng/ngành nghề trích xuất từ AI với các ID sẵn có trong hồ sơ ứng viên.
  - Gọi `elasticsearchService.searchJobs` để tìm kiếm nhanh các công việc phù hợp:
    - Bắt buộc phải khớp ít nhất một ngành nghề hoặc kỹ năng (`must` match với `industryIDs` và `skillIDs`).
    - Lọc ưu tiên địa điểm làm việc (`should` match với `location`).
    - Loại bỏ hoàn toàn bộ lọc cấp bậc (`level`) để mở rộng cơ hội gợi ý.
  - Sau khi lấy danh sách công việc từ Elasticsearch và chi tiết từ MongoDB, hệ thống đính kèm lời giải thích phù hợp mặc định (`aiExplanation`) dạng tĩnh để tiết kiệm token và triệt tiêu độ trễ gọi AI lần 2 (loại bỏ hoàn toàn prompt `job-matching-explanation.prompt.ts`).
- **Tối ưu hóa hiệu năng bằng Redis Caching**:
  - Dữ liệu gợi ý được lưu vào Redis cache với key `recommendations:${userId}` và TTL là 24 giờ (đối với tài khoản đã điền hồ sơ) hoặc 1 giờ (đối với tài khoản trống thông tin).
  - Khi người dùng truy cập trang gợi ý việc làm, hệ thống lấy dữ liệu trực tiếp từ Redis trong <10ms, loại bỏ hoàn toàn độ trễ 5-10s gọi API Gemini.
- **Cơ chế Pre-warming (Làm nóng cache chạy nền)**:
  - Sử dụng NestJS `EventEmitter` để kích hoạt các tiến trình tính toán chạy nền không đồng bộ (`@OnEvent('...', { async: true })`), không chặn các API chính.
  - Sự kiện `candidate.profile.warmup` phát ra khi đăng nhập thành công hoặc khi lấy profile ban đầu. Service kiểm tra xem cache đã tồn tại chưa; nếu chưa, nó sẽ chạy nền tạo cache sẵn.
  - Sự kiện `candidate.profile.updated` phát ra khi ứng viên cập nhật thông tin cá nhân. Cache cũ bị ghi đè bằng cache mới tính toán nền.
  - Sự kiện `candidate.cv.updated` phát ra khi ứng viên thêm/sửa/xóa CV. Kích hoạt tính toán nền để cập nhật gợi ý mới nhất.

## Lưu trữ dữ liệu (quyết định hiện tại)

- Lịch sử chat AI được lưu trong bảng (Collection) `AiChatHistory` của database thay vì dùng Redis. Điều này giúp giữ ngữ cảnh theo session và tiện tra cứu sau này.
- Dữ liệu chấm điểm CV/JD vẫn chỉ dùng để trả về UI hoặc lưu vào bảng hiện có (tùy yêu cầu) và không lưu riêng lẻ.
- Tạo Schema mới cho AI Chat History với key `sessionId`.

## Tối ưu token

- Chỉ gửi job_context hiện tại.
- Lọc giới hạn lịch sử chat gửi đi (vd: 6 messages gần nhất).
- Không gửi lịch sử đoạn chat của job cũ.
- Dùng summary cho CV và JD.

## Bảo mật

- Không gửi thông tin nhạy cảm lên LLM
- Ẩn danh thông tin cá nhân nếu cần

## API đề nghị

- GET /ai/chat?jobId=...&question=...
- POST /ai/cv-score { cvId }
- POST /ai/jd-match { cvId, jobId }
- GET /ai/recommend-jobs (Gợi ý công việc bằng AI, hỗ trợ cả khách vả người dùng đã đăng nhập)

## Mô hình dữ liệu

- Không tạo schema mới cho AI ở giai đoạn này.
- Nếu cần lưu kết quả về sau, sẽ bổ sung theo yêu cầu báo cáo/thống kê.

## Chuẩn bị dữ liệu đầu vào (Context Builder)

### Job context

- Nguồn: title, company, level, location, salary, requirements, description
- Chuyển thành summary ngắn 5-8 dòng
- Ví dụ:
  - Vi trí: Backend Developer (Node.js)
  - Công ty: ABC Tech
  - Kỹ năng chính: NestJS, PostgreSQL, Redisl
  - Kinh nghiệm: 2-4 năm
  - Mô tả ngắn: Xây dựng API, tối ưu hiệu năng

### CV context

- Nguồn: kỹ năng, kinh nghiệm, dự án, học vấn, chứng chỉ
- Tóm tắt theo cấu trúc: kỹ năng chính, năm kinh nghiệm, dự án tiêu biểu, thành tựu

## Cơ chế chuyển job trong chat AI (tiết kiệm token)

Nguyên tắc: chỉ giữ context của job hiện tại, không gửi chat cũ.

Luồng đề nghị:

1. UI gửi jobId hiện tại trong mỗi request chat.
2. Service so sánh jobId với current_job_id của thread.
3. Nếu đổi job:
   - memory.clear()
   - cập nhật current_job_id
   - nạp job_context mới vào prompt
4. Gọi LLM với prompt tối giản (job_context + user_input).

## Prompt mẫu (khuyến nghị)

### Chatbot prompt (system)

- Vai trò: trợ lý tư vấn việc làm
- Mục tiêu: trả lời ngắn gọn, đúng trọng tâm, dựa trên job_context
- Ràng buộc: nếu thiếu dữ liệu, hỏi lại người dùng

### Chấm CV prompt (system)

- Vai trò: chuyên viên HR
- Mục tiêu: chấm điểm 0-100, nêu điểm mạnh/yếu, gợi ý cải thiện
- Ràng buộc: trả về JSON hợp lệ

### Chấm khớp CV-JD prompt (system)

- Vai trò: chuyên viên tuyển dụng
- Mục tiêu: so sánh CV và JD, đưa ra match_score và danh sách thiếu kỹ năng
- Ràng buộc: trả về JSON hợp lệ

## Định dạng output JSON (chuẩn hóa)

### Chấm CV

{
"score": 0,
"strengths": ["..."],
"weaknesses": ["..."],
"suggestions": ["..."]
}

### Chấm khớp CV-JD

{
"match_score": 0,
"matched_skills": ["..."],
"missing_skills": ["..."],
"notes": "..."
}

## Xử lý lỗi và bảo vệ hệ thống

- Timeout LLM: trả về thông báo lịch sự, không lộ lỗi nội bộ
- Lỗi JSON output: fallback parse và yêu cầu LLM trả lại JSON
- Giới hạn độ dài input: cắt bớt và ưu tiên phần quan trọng

## Giới hạn token và tối ưu chi phí

- Job context: tối đa 800-1200 ký tự
- CV context: tối đa 1200-2000 ký tự
- Không gửi lịch sử chat cũ
- Nếu cần, lưu summary nội bộ nhưng không gửi toàn bộ lịch sử

## Xem model dduocj hỗ trợ

- https://generativelanguage.googleapis.com/v1beta/models?key=[GCP_API_KEY]

## Quan sát và đo lường (khuyến nghị)

- Log: request_id, user_id, job_id, latency, token_in/out
- Theo dõi tần suất lỗi LLM và tỉ lệ JSON không hợp lệ
- Đo độ hài lòng người dùng qua feedback sau mỗi câu trả lời

## Kết luận

Kiến trúc này đơn giản, dễ mở rộng và tiết kiệm token:

- Chatbot có context theo job hiện tại
- Chấm CV và chấm độ khớp CV-JD độc lập
- Sử dụng LangChain + Gemini theo hướng dẫn, tách prompt và service rõ ràng
