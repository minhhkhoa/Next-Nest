# Kiến trúc Module Quảng cáo (Advertising Architecture)

## 1. Tổng quan

Tài liệu này mô tả kiến trúc dữ liệu cho tính năng quảng cáo trong hệ thống Next-Nest, được thiết kế theo hướng gọn cho đồ án với 3 schema chính:

- `AdSlot`: Quản lý vị trí quảng cáo và cấu hình giá/ràng buộc hiển thị.
- `AdBooking`: Quản lý đơn thuê quảng cáo của công ty, lịch chạy và trạng thái hàng chờ.
- `AdPayment`: Quản lý giao dịch thanh toán cho mỗi booking (đã chuẩn bị để tích hợp SePay webhook).

Mục tiêu chính của thiết kế:

1. Đủ dữ liệu để làm CRUD, đặt lịch, xếp hàng công bằng theo slot.
2. Tách thanh toán sang schema riêng để `AdBooking` không bị quá dài.
3. Giữ cấu trúc đơn giản, dễ demo và dễ mở rộng sau này.

## 2. Vị trí module trong codebase

Các module nằm trong thư mục `server/src/modules/advertising/`:

- `ad-slot`: Quản lý slot quảng cáo.
- `ad-booking`: Quản lý đơn quảng cáo.
- `ad-payment`: Quản lý thanh toán.

Module cha:

- `server/src/modules/advertising/advertising.module.ts`

Schema files chính:

- `server/src/modules/advertising/ad-slot/schemas/ad-slot.schema.ts`
- `server/src/modules/advertising/ad-booking/schemas/ad-booking.schema.ts`
- `server/src/modules/advertising/ad-payment/schemas/ad-payment.schema.ts`

## 3. Chi tiết schema `AdSlot`

### 3.1. Mục đích

`AdSlot` là nơi định nghĩa các vị trí quảng cáo có thể thuê trong hệ thống (ví dụ: HOME_TOP, JOB_DETAIL_INLINE). Đây là cấu hình gốc để booking biết đặt vào đâu, giá bao nhiêu, và vị trí đó hỗ trợ loại quảng cáo nào.

### 3.2. Ý nghĩa từng field

- `code` (string, required, unique, uppercase):
  - Mã slot duy nhất trong toàn hệ thống.
  - Dùng để liên kết logic với booking (`slotCode`).
  - Viết hoa giúp chuẩn hóa dữ liệu và tránh trùng kiểu khác chữ hoa/chữ thường.

- `name` (string, required):
  - Tên hiển thị dễ hiểu cho admin/recruiter khi chọn vị trí.

- `page` (enum, required):
  - Slot thuộc trang nào trong app (`HOME`, `JOB_DETAIL`, `COMPANY_DETAIL`).
  - Giúp frontend biết đúng khu vực render.

- `adModeAllowed` (enum, required, default `BOTH`):
  - Quy định slot hỗ trợ kiểu quảng cáo nào:
    - `NON_DISMISSIBLE`: quảng cáo cứng, không có nút tắt.
    - `DISMISSIBLE`: quảng cáo có nút tắt.
    - `BOTH`: hỗ trợ cả 2 loại.

- `width` (number, required, min 1):
  - Chiều rộng chuẩn của ảnh/banner cho slot.

- `height` (number, required, min 1):
  - Chiều cao chuẩn của ảnh/banner cho slot.

- `pricePerDay` (number, required, min 1):
  - Đơn giá thuê theo ngày cho slot.

- `maxDurationDays` (number, required, min 1, default 14):
  - Giới hạn số ngày tối đa cho mỗi lần thuê.
  - Tránh một công ty giữ slot quá lâu trong đồ án.

- `isActive` (boolean, default true):
  - Bật/tắt slot.
  - Slot tắt thì không nên nhận booking mới.

- `isDeleted`, `deletedAt`:
  - Cơ chế xóa mềm.

- `createdAt`, `updatedAt`:
  - Thời điểm tạo/cập nhật bản ghi (từ `timestamps: true`).

- `createdBy`, `updatedBy`, `deletedBy`:
  - Dữ liệu audit người thao tác.

### 3.3. Index trong schema

- `AdSlotSchema.index({ isActive: 1, isDeleted: 1 })`
  - Tối ưu truy vấn danh sách slot còn dùng được.

## 4. Chi tiết schema `AdBooking`

### 4.1. Mục đích

`AdBooking` là đơn thuê quảng cáo của công ty. Schema này chứa dữ liệu chính về nội dung quảng cáo, khung thời gian, trạng thái vòng đời và thông tin xếp hàng.

### 4.2. Ý nghĩa từng field

- `companyId` (ObjectId ref `Company`, required):
  - Công ty sở hữu booking.

- `recruiterId` (ObjectId ref `User`, required):
  - Tài khoản recruiter_admin tạo booking.

- `slotCode` (string, required, uppercase):
  - Slot mà booking muốn thuê.
  - Dùng `code` thay vì `slotId` để truy vấn nhanh theo mã chuẩn.

- `adType` (enum, required):
  - Loại quảng cáo của booking (`NON_DISMISSIBLE` hoặc `DISMISSIBLE`).

- `imageUrl` (string, required):
  - URL ảnh banner dùng để hiển thị.

- `targetUrl` (string, required):
  - Link điều hướng khi người dùng click banner.

- `startAt` (Date, required):
  - Thời điểm bắt đầu chạy quảng cáo.

- `endAt` (Date, required):
  - Thời điểm kết thúc quảng cáo.

- `status` (enum, required, default `PENDING_PAYMENT`):
  - Trạng thái vòng đời booking:
    - `PENDING_PAYMENT`: chờ thanh toán.
    - `WAITING_SLOT`: đang xếp hàng vì slot chưa trống.
    - `SCHEDULED`: đã lên lịch.
    - `RUNNING`: đang chạy.
    - `COMPLETED`: đã hoàn tất.
    - `CANCELLED`: đã hủy.
    - `EXPIRED`: hết hạn/không còn hiệu lực.

- `queueNo` (number, optional, min 1):
  - Thứ tự xếp hàng khi booking ở trạng thái chờ slot.
  - Null khi booking không ở hàng chờ.

- `amount` (number, required, min 0):
  - Tổng tiền của đơn booking.

- `paymentId` (ObjectId ref `AdPayment`, optional):
  - Tham chiếu tới giao dịch thanh toán liên quan.

- `isDeleted`, `deletedAt`:
  - Cơ chế xóa mềm.

- `createdAt`, `updatedAt`:
  - Thời điểm tạo/cập nhật bản ghi.

- `createdBy`, `updatedBy`, `deletedBy`:
  - Dữ liệu audit người thao tác.

### 4.3. Index trong schema

- `AdBookingSchema.index({ slotCode: 1, status: 1, startAt: 1 })`
  - Tối ưu kiểm tra lịch theo slot/trạng thái/thời gian.

- `AdBookingSchema.index({ slotCode: 1, queueNo: 1 })`
  - Tối ưu truy vấn booking đầu hàng chờ của mỗi slot.

- `AdBookingSchema.index({ companyId: 1, createdAt: -1 })`
  - Tối ưu trang lịch sử booking của doanh nghiệp.

## 5. Chi tiết schema `AdPayment`

### 5.1. Mục đích

`AdPayment` lưu giao dịch thanh toán riêng để tách khỏi booking, giúp dữ liệu booking gọn hơn và dễ tích hợp cổng thanh toán sau này.

### 5.2. Ý nghĩa từng field

- `bookingId` (ObjectId ref `AdBooking`, required):
  - Booking mà giao dịch này thuộc về.

- `provider` (enum, required, default `SEPAY`):
  - Nhà cung cấp thanh toán.
  - Bản hiện tại đang chuẩn hóa cho SePay.

- `orderCode` (string, required, unique):
  - Mã đơn thanh toán duy nhất.
  - Dùng để đối soát và idempotency khi xử lý callback.

- `transferContent` (string, required, unique):
  - Nội dung chuyển khoản duy nhất.
  - Dùng để map giao dịch ngân hàng về đúng booking.

- `amount` (number, required, min 0):
  - Số tiền cần thanh toán.

- `status` (enum, required, default `PENDING`):
  - Trạng thái giao dịch:
    - `PENDING`: chờ thanh toán.
    - `PAID`: thanh toán thành công.
    - `FAILED`: thanh toán lỗi.
    - `EXPIRED`: quá hạn thanh toán.

- `paidAt` (Date, optional):
  - Thời điểm ghi nhận đã thanh toán thành công.

- `webhookPayload` (object, optional):
  - Dữ liệu callback thô từ cổng thanh toán.
  - Hữu ích cho log/debug/đối soát.

- `isDeleted`, `deletedAt`:
  - Cơ chế xóa mềm.

- `createdAt`, `updatedAt`:
  - Thời điểm tạo/cập nhật bản ghi.

- `createdBy`, `updatedBy`, `deletedBy`:
  - Dữ liệu audit người thao tác.

### 5.3. Index trong schema

- `AdPaymentSchema.index({ bookingId: 1, createdAt: -1 })`
  - Tối ưu lấy lịch sử giao dịch theo booking.

## 6. Quan hệ dữ liệu giữa 3 schema

- Một `AdSlot` có thể có nhiều `AdBooking` thông qua `slotCode`.
- Một `AdBooking` có thể liên kết một `AdPayment` gần nhất qua `paymentId`.
- Một `AdPayment` luôn tham chiếu ngược về `AdBooking` qua `bookingId`.

Thiết kế này giúp:

1. Truy vấn booking theo slot nhanh (đặt lịch/xếp hàng).
2. Truy vấn payment theo booking rõ ràng (đối soát thanh toán).
3. Tách concern giữa lịch quảng cáo và giao dịch tài chính.

## 7. Luồng nghiệp vụ tối giản dự kiến

1. Recruiter tạo booking với `slotCode`, `adType`, `startAt`, `endAt`, `amount`.
2. Hệ thống kiểm tra slot đang trống hay đã kín.
3. Nếu trống: booking ở `PENDING_PAYMENT`.
4. Nếu kín: booking vào `WAITING_SLOT`, có `queueNo`.
5. Tạo payment record trong `AdPayment`.
6. Khi webhook báo `PAID`, cập nhật payment status và chuyển trạng thái booking phù hợp (`SCHEDULED` hoặc giữ `WAITING_SLOT` nếu slot chưa rảnh).
7. Cron xử lý `SCHEDULED -> RUNNING -> COMPLETED` theo thời gian.
