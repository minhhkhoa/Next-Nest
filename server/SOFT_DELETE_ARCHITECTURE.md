# Kiến Trúc Xóa Mềm và Mối Quan Hệ Giữa User, Company, Job

Tài liệu này giải thích chi tiết về luồng hoạt động của việc Tạo, Cập nhật và Xóa (mềm) đối với ba module có mối liên kết chặt chẽ: `User`, `Company`, và `Job`. Hệ thống sử dụng cơ chế xóa mềm (soft-delete) để bảo toàn dữ liệu và các mối quan hệ, đồng thời cho phép khả năng khôi phục.

## Các Trường Dữ Liệu Quan Trọng

-   **`isDeleted` (boolean):** Cờ chính cho việc xóa mềm. Khi `true`, bản ghi được coi là đã bị xóa và không hiển thị trong các truy vấn thông thường.
-   **`deletedAt` (Date):** Dấu thời gian ghi lại thời điểm bản ghi bị xóa mềm.
-   **`deletedBy` (ObjectRef):** Lưu thông tin của quản trị viên đã thực hiện hành động xóa.
-   **`status` (string):** Biểu thị trạng thái vòng đời của một bản ghi.
    -   **Company:**
        -   `PENDING`: Mới tạo, đang chờ Super Admin phê duyệt.
        -   `ACCEPT`: Đã được phê duyệt và đang hoạt động.
        -   `REJECTED`: Đã bị từ chối (hiện tại logic là xóa luôn thay vì chỉ set status).
    -   **User (`employerInfo.userStatus`):**
        -   `PENDING`: Đã gửi yêu cầu tham gia công ty, đang chờ Recruiter Admin phê duyệt.
        -   `ACTIVE`: Là thành viên đang hoạt động trong một công ty.
        -   `INACTIVE`: Bị vô hiệu hóa, thường xảy ra khi công ty của họ bị xóa.
    -   **Job:**
        -   `active`: Tin tuyển dụng đang hoạt động.
        -   `inactive`: Tin tuyển dụng không hoạt động.
        -   `isActive` (boolean): Một cờ song song, `true` nếu tin được duyệt và hiển thị.

---

## Luồng Hoạt Động Chi Tiết

### 1. Module `Company` (Công ty)

#### Tạo Mới (`create`)

1.  Một người dùng có vai trò `RECRUITER` thực hiện tạo công ty.
2.  Hành động này được bọc trong một **Mongoose Transaction** để đảm bảo tính toàn vẹn.
3.  Một bản ghi `Company` mới được tạo với `status: 'PENDING'`.
4.  Người dùng thực hiện hành động này được **tự động nâng cấp**:
    -   Vai trò (`roleID`) được cập nhật thành `RECRUITER_ADMIN`.
    -   Trường `employerInfo` được cập nhật để đánh dấu họ là chủ sở hữu (`isOwner: true`) của công ty vừa tạo.
5.  Hệ thống gửi thông báo đến `SUPER_ADMIN` để yêu cầu phê duyệt.
6.  **Phê duyệt bởi Super Admin:**
    -   **Nếu chấp nhận (`ACCEPT`):** `status` của công ty được đổi thành `ACCEPT`. `userStatus` của các thành viên trong công ty được đổi thành `ACTIVE`.
    -   **Nếu từ chối (`REJECT`):** Bản ghi công ty bị **xóa hoàn toàn** khỏi database. `employerInfo` và `roleID` của người tạo được reset về trạng thái ban đầu.

#### Cập Nhật (`update`)

-   Chỉ `SUPER_ADMIN` hoặc `RECRUITER_ADMIN` của công ty đó mới có thể cập nhật.
-   Một điểm đáng chú ý: Nếu `SUPER_ADMIN` cập nhật `status` của công ty về lại `PENDING`, thì `userStatus` của tất cả nhân viên trong công ty đó cũng sẽ bị reset về `PENDING`.

#### Xóa Mềm (`remove` / `removeMany`)

Đây là một hành động hệ thống phức tạp, được xử lý qua transaction.

1.  Bản ghi `Company` được cập nhật: `isDeleted: true`.
2.  **Tác động đến Nhân viên (User):** Hệ thống gọi `userService.deactivateByCompany` để cập nhật tất cả nhân viên thuộc công ty này. Trạng thái của họ (`employerInfo.userStatus`) được đổi thành `INACTIVE`. Họ không bị xóa, nhưng quyền hạn tuyển dụng của họ bị vô hiệu hóa.
3.  **Tác động đến Công việc (Job):** Hệ thống gọi `jobService.softDeleteManyByCompany` để **xóa mềm** tất cả các tin tuyển dụng (`isDeleted: true`, `status: 'inactive'`) thuộc về công ty này.

---

### 2. Module `User` (Người dùng/Nhân viên)

#### Tạo Mới (`register`, `recruiterRegister`)

-   Tạo người dùng với vai trò `CANDIDATE` (ứng viên) hoặc `RECRUITER` (nhà tuyển dụng). Tại bước này, họ chưa liên kết với công ty nào.

#### Cập Nhật (`update`)

-   Cập nhật thông tin cá nhân. Các hành động đặc biệt như thay đổi vai trò (`updateUserRole`) hoặc tham gia công ty (`handleJoinCompany`) có logic riêng.
-   Khi một `RECRUITER` xin tham gia công ty, `employerInfo` của họ được cập nhật với `companyID` và `userStatus: 'PENDING'`. `RECRUITER_ADMIN` của công ty đó sẽ nhận được thông báo để duyệt.

#### Xóa Mềm (`softDeleteUserAndProfile`)

Đây là hành động có sự phân nhánh logic phức tạp nhất, được xử lý trong transaction.

1.  **Kiểm tra vai trò của người bị xóa:**
    -   **Trường hợp 1: Là nhân viên bình thường (không phải Owner).**
        -   Hệ thống chỉ đơn giản xóa mềm bản ghi `User` và `DetailProfile` liên quan (`isDeleted: true`).
    -   **Trường hợp 2: Là chủ sở hữu công ty (`isOwner: true`).**
        -   **Phân nhánh A: Công ty vẫn còn nhân viên khác.**
            -   Hành động xóa **bị chặn** nếu không cung cấp `newOwnerID` (ID của người sẽ kế thừa quyền sở hữu).
            -   Nếu `newOwnerID` được cung cấp:
                1.  Người kế thừa (`newOwnerID`) được nâng cấp thành `Owner` và `RECRUITER_ADMIN`.
                2.  Người chủ cũ (người bị xóa) bị hạ quyền (`isOwner: false`), sau đó bị xóa mềm.
        -   **Phân nhánh B: Là thành viên duy nhất trong công ty.**
            -   Việc xóa người dùng này sẽ kích hoạt một quy trình **xóa toàn bộ hệ sinh thái công ty**.
            -   Hệ thống gọi `companyService.removeBySystem`, thực hiện các bước tương tự như khi xóa một công ty (xóa mềm công ty, vô hiệu hóa nhân viên, xóa mềm jobs).

---

### 3. Module `Job` (Công việc/Tin tuyển dụng)

#### Tạo Mới (`create`)

-   **Phân quyền người tạo:**
    -   Nếu người tạo là `RECRUITER` thường: Tin tuyển dụng được tạo với trạng thái `isActive: false` (chưa hiển thị) và cần `RECRUITER_ADMIN` của công ty phê duyệt.
    -   Nếu người tạo là `RECRUITER_ADMIN`: Tin tuyển dụng được tạo với trạng thái `isActive: true` (tự động duyệt và hiển thị).

#### Cập Nhật (`update`)

-   **Phân quyền người cập nhật:**
    -   Nếu `RECRUITER` thường cập nhật: Tin tuyển dụng sẽ bị chuyển về `isActive: false` và cần được phê duyệt lại.
    -   Nếu `SUPER_ADMIN` hoặc `RECRUITER_ADMIN` cập nhật: Có thể tùy chỉnh `isActive` và các trạng thái khác. Chỉ `SUPER_ADMIN` mới có quyền quản lý cờ `isHot` (tin nổi bật).

#### Xóa Mềm (`remove` / `removeMany`)

-   Đây là hành động đơn giản nhất trong ba module.
-   Chỉ cập nhật bản ghi `Job` với `isDeleted: true`.
-   Hành động này **không** gây ra tác động dây chuyền đến `User` hay `Company`.
-   Hệ thống kiểm tra quyền hạn để đảm bảo chỉ `SUPER_ADMIN` hoặc `RECRUITER_ADMIN` của đúng công ty đó mới có quyền xóa.

## Sơ Đồ Tóm Tắt Luồng Xóa

-   **`Xóa User (Owner)`**  ->  `Xóa Company`  ->  (`Vô hiệu hóa User (Staff)`, `Xóa Job`)
-   **`Xóa Company`** -> (`Vô hiệu hóa User (Staff)`, `Xóa Job`)
-   **`Xóa Job`** -> (Không ảnh hưởng)

Kiến trúc này đảm bảo rằng các hành động xóa luôn duy trì được tính nhất quán của dữ liệu, tránh các bản ghi "mồ côi" và cho phép quản trị viên có khả năng khôi phục lại gần như toàn bộ hệ sinh thái dữ liệu khi cần.
