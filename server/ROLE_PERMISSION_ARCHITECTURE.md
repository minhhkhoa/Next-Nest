# Kiến trúc phân quyền (Role/Permission) trong hệ thống Next-Nest

## 1. Tổng quan

Hệ thống Next-Nest triển khai cơ chế kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC) và quyền hạn (Permission-Based Access Control - PBAC).Để quản lý quyền hạn của người dùng. Hệ thống này cho phép định nghĩa các vai trò (Role) và các quyền hạn (Permission) cụ thể, sau đó gán các quyền hạn này cho vai trò và gán vai trò cho người dùng. Điều này giúp kiểm soát chặt chẽ quyền truy cập vào các tài nguyên và chức năng của ứng dụng.

## 2. Các khái niệm cơ bản

*   **Role (Vai trò)**: Là một tập hợp các quyền hạn. Thay vì gán trực tiếp các quyền cho từng người dùng, người dùng sẽ được gán một vai trò cụ thể.
*   **Permission (Quyền hạn)**: Đại diện cho một hành động cụ thể mà người dùng được phép thực hiện (ví dụ: `users.create`, `posts.edit`, `products.view`). Các quyền hạn có thể rất chi tiết, gắn liền với các đường dẫn API và phương thức HTTP.
*   **User (Người dùng)**: Là đối tượng tương tác với hệ thống và được gán các vai trò để xác định quyền truy cập của họ.

## 3. Kiến trúc phía Server (NestJS)

Backend NestJS quản lý toàn bộ logic phân quyền, từ mô hình dữ liệu đến các dịch vụ nghiệp vụ và cơ chế kiểm tra quyền.

### 3.1. Mô hình dữ liệu (Database Schema)

Dữ liệu vai trò và quyền hạn được lưu trữ trong MongoDB và được định nghĩa thông qua Mongoose Schema.

*   **`server/src/modules/roles/schemas/role.schema.ts`**: Định nghĩa cấu trúc của một vai trò.
    *   `name: MultiLang`: Tên vai trò (hỗ trợ đa ngôn ngữ).
    *   `description: MultiLang`: Mô tả vai trò (hỗ trợ đa ngôn ngữ).
    *   `isActived: boolean`: Trạng thái hoạt động của vai trò.
    *   `permissions: Types.ObjectId[]`: Một mảng các `ObjectId`, tham chiếu đến các quyền hạn liên quan. Đây là mối quan hệ `một-vai-trò-có-nhiều-quyền-hạn`.
    *   `createdBy`, `updatedBy`, `deletedBy`: Thông tin người tạo, cập nhật, xóa (bao gồm `_id`, `name`, `email`) để theo dõi.
    *   `createdAt`, `updatedAt`, `deletedAt`: Thời gian tạo, cập nhật, và xóa (dành cho soft delete).

*   **`server/src/modules/permissions/schemas/permission.schema.ts`**: Định nghĩa cấu trúc của một quyền hạn.
    *   `name: MultiLang`: Tên hiển thị của quyền hạn (hỗ trợ đa ngôn ngữ).
    *   `code: string`: Mã định danh duy nhất cho quyền hạn (ví dụ: `users.create`, `posts.view`). Trường này là `required` và `unique`.
    *   `apiPath: string`: Đường dẫn API mà quyền hạn này kiểm soát (ví dụ: `/api/users`).
    *   `method: string`: Phương thức HTTP (GET, POST, PUT, DELETE) mà quyền hạn áp dụng.
    *   `module: string`: Module nghiệp vụ mà quyền hạn này thuộc về (ví dụ: "User", "Role", "Product"). Trường này rất quan trọng cho việc tổ chức quyền hạn.
    *   `createdBy`, `updatedBy`, `deletedBy`: Thông tin người tạo, cập nhật, xóa.
    *   `createdAt`, `updatedAt`, `deletedAt`: Thời gian tạo, cập nhật, và xóa (dành cho soft delete).

### 3.2. Module `roles` (`server/src/modules/roles/`)

Module này quản lý tất cả các hoạt động liên quan đến vai trò.

*   **`roles.service.ts`**: Chứa logic nghiệp vụ chính.
    *   `create`, `findAll`, `findByFilter`, `findOne`, `update`, `remove`, `removeMany`: Các phương thức CRUD tiêu chuẩn cho vai trò.
    *   `getRoleByName(name: string)`: Tìm vai trò theo tên (hỗ trợ đa ngôn ngữ).
    *   `getPermissionsByRoleID(roleID: string)`: Truy xuất tất cả các quyền hạn được gán cho một vai trò cụ thể bằng cách `populate` trường `permissions` từ schema `Permission`.
    *   Sử dụng `soft-delete-plugin-mongoose` để thực hiện xóa mềm (soft delete).
    *   Tích hợp `TranslationService` để xử lý dữ liệu đa ngôn ngữ.

*   **`roles.controller.ts`**: Cung cấp các API endpoint cho vai trò.
    *   Các endpoint RESTful (`POST /role`, `GET /role`, `PATCH /role/:id`, `DELETE /role/:id`, `DELETE /role/deleteMany`) để quản lý vai trò.
    *   Sử dụng `@ApiTags('role')` và `@ApiOperation` từ Swagger để tạo tài liệu API tự động.
    *   `@ResponseMessage`: Decorator tùy chỉnh để đặt thông báo thành công cho phản hồi.
    *   `@userDecorator()`: Decorator để inject thông tin người dùng đã xác thực, ngụ ý rằng các endpoint này yêu cầu xác thực.

### 3.3. Module `permissions` (`server/src/modules/permissions/`)

Module này quản lý các quyền hạn và khám phá các module nghiệp vụ.

*   **`permissions.service.ts`**: Chứa logic nghiệp vụ chính.
    *   `create`, `findAll`, `findByFilter`, `findOne`, `update`, `remove`, `removeMany`: Các phương thức CRUD tiêu chuẩn cho quyền hạn.
    *   `getGroupModule()`: Truy xuất tất cả quyền hạn và nhóm chúng lại theo trường `module`. Điều này rất hữu ích để hiển thị các quyền hạn một cách có tổ chức trên giao diện người dùng.
    *   Sử dụng `soft-delete-plugin-mongoose` cho xóa mềm.
    *   Tích hợp `TranslationService` để xử lý dữ liệu đa ngôn ngữ.

*   **`permissions.controller.ts`**: Cung cấp các API endpoint cho quyền hạn.
    *   Các endpoint RESTful tương tự như `roles.controller.ts`.
    *   Endpoint `GET /permission/get-group-module`: Để lấy các quyền hạn đã được nhóm theo module.
    *   Endpoint `GET /permission/modules`: Gọi `discoveryService.getBusinessModules()` để lấy danh sách các module nghiệp vụ đã được định nghĩa.

*   **`discovery.service.ts`**: Đây là một thành phần quan trọng cho việc khám phá động các module nghiệp vụ và tổ chức quyền hạn.
    *   Sử dụng `ModulesContainer` (từ `@nestjs/core`) để truy cập tất cả các module NestJS đã được tải trong ứng dụng.
    *   Sử dụng `Reflector` (từ `@nestjs/core`) để đọc metadata từ các decorator.
    *   `getBusinessModules()`: Lặp qua tất cả các module, kiểm tra xem chúng có được đánh dấu bằng decorator `@BusinessModule()` hay không, và trả về tên của các module đó. Điều này cho phép hệ thống tự động nhận diện các module mà quyền hạn có thể được gán vào.

### 3.4. Cơ chế ủy quyền (Authorization)

Đây là phần quan trọng nhất, nơi hệ thống thực thi việc kiểm tra quyền truy cập.

*   **`server/src/common/guard/permission.guard.ts` - PermissionGuard**:
    Đây là một NestJS Guard triển khai giao diện `CanActivate`, được áp dụng để bảo vệ các endpoint.

    *   **Cơ chế hoạt động của `canActivate`**:
        1.  **Xác thực người dùng**: `PermissionGuard` giả định rằng một `AuthGuard` (ví dụ: `JwtAuthGuard`) đã chạy trước đó, xác thực người dùng thành công và đính kèm đối tượng `user` vào `request` (`request.user`). Đối tượng `user` này phải chứa một mảng `permissions` (được lấy từ các vai trò của người dùng), với mỗi quyền bao gồm `method` và `apiPath`.

            *Lưu ý: Cách `request.user.permissions` được điền là rất quan trọng. Mảng này chứa các quyền mà người dùng hiện tại có, được truy xuất dựa trên các vai trò của họ trong quá trình xác thực.*

        2.  **Bypass Public (`@Public()`)**: Guard sử dụng `Reflector` để kiểm tra xem route hiện tại có được đánh dấu bằng decorator `@Public()` hay không (định nghĩa trong `server/src/common/decorator/customize.ts`). Nếu có, guard ngay lập tức trả về `true`, bỏ qua mọi kiểm tra ủy quyền và thậm chí cả xác thực.

        3.  **Bypass Public Permission (`@PublicPermission()`)**: Nếu route được đánh dấu bằng `@PublicPermission()` (định nghĩa trong `server/src/common/decorator/customize.ts`), guard cũng trả về `true`. Điều này có nghĩa là người dùng vẫn cần phải đăng nhập (vì `@Public()` không áp dụng), nhưng không cần kiểm tra quyền cụ thể nào khác ngoài việc đã xác thực.

        4.  **Bypass route `/api/auth`**: Guard có một logic cứng để bỏ qua mọi kiểm tra cho các route bắt đầu bằng `/api/auth`. Đây là nơi xử lý các endpoint đăng nhập, đăng ký, refresh token...

        5.  **Bypass cho SUPER_ADMIN**: Nếu thuộc tính `roleCodeName` của người dùng (`user.roleCodeName`) khớp với `role_super_admin` được cấu hình (lấy từ `ConfigService`), người dùng đó được cấp quyền truy cập ngay lập tức vào mọi tài nguyên. Điều này tạo ra một vai trò "siêu quản trị viên".

        6.  **Logic kiểm tra quyền cụ thể**:
            *   Guard lấy `method` (`request.method`) và `apiPath` (`request.route?.path`) của yêu cầu hiện tại.
            *   Nó duyệt qua mảng `permissions` của người dùng (`user.permissions`).
            *   Nếu tìm thấy bất kỳ quyền nào trong mảng `user.permissions` có `method` và `apiPath` khớp chính xác với yêu cầu, thì `hasPermission` là `true`.
            *   Nếu `hasPermission` là `false`, guard sẽ ném ra một `ForbiddenException`, từ chối truy cập.

*   **Decorators liên quan (`server/src/common/decorator/customize.ts`)**:
    *   `@Public()`: Đánh dấu route không cần xác thực/ủy quyền.
    *   `@PublicPermission()`: Đánh dấu route cần xác thực nhưng không cần kiểm tra quyền hạn cụ thể nào khác.
    *   `@BusinessModule()`: Đánh dấu module là module nghiệp vụ để `DiscoveryService` khám phá.

## 4. Luồng hoạt động (Ví dụ: Người dùng tạo bài viết)

1.  **Định nghĩa quyền**:
    *   Một quyền hạn "Tạo bài viết" được tạo với `code: 'posts.create'`, `apiPath: '/api/posts'`, `method: 'POST'`, `module: 'Post'`.

2.  **Định nghĩa vai trò**:
    *   Một vai trò "Biên tập viên" được tạo.
    *   Quyền hạn "Tạo bài viết" được gán cho vai trò "Biên tập viên".

3.  **Gán vai trò**:
    *   Người dùng "Alice" được gán vai trò "Biên tập viên".

4.  **Người dùng thực hiện hành động (Client)**:
    *   Alice cố gắng gửi yêu cầu POST đến `/api/posts` để tạo một bài viết. Request này mang theo JWT token của Alice.

5.  **Xác thực và Ủy quyền (Server)**:
    *   **Xác thực (AuthGuard)**: Một `AuthGuard` (chạy trước `PermissionGuard`) xác thực JWT token của Alice. Sau khi xác thực thành công, nó truy xuất các vai trò của Alice và các quyền hạn được liên kết với các vai trò đó (dựa trên dữ liệu từ `Role` và `Permission` schemas). Nó đính kèm đối tượng `user` đã xác thực (bao gồm mảng `permissions` của Alice) vào `request` object.
    *   **Ủy quyền (`PermissionGuard`)**:
        *   `PermissionGuard` được kích hoạt trên route POST `/api/posts`.
        *   Guard kiểm tra các điều kiện bypass: route không phải `@Public()`, `@PublicPermission()`, không phải `/api/auth`, và Alice không phải Super Admin.
        *   Guard lấy `method` là `POST` và `apiPath` là `/api/posts` từ yêu cầu.
        *   Guard duyệt qua mảng `request.user.permissions` của Alice.
        *   Guard tìm thấy một quyền trong mảng đó khớp với `method: 'POST'` và `apiPath: '/api/posts'`.
        *   Guard trả về `true`, cho phép yêu cầu được xử lý.

6.  **Hành động thành công**:
    *   Yêu cầu của Alice được chuyển đến `PostsController` và `PostsService` để tạo bài viết.

## 5. Kết luận

Hệ thống phân quyền được xây dựng một cách linh hoạt và mạnh mẽ, cho phép quản lý chi tiết các quyền truy cập thông qua vai trò và quyền hạn. Cơ chế soft delete, hỗ trợ đa ngôn ngữ, và khả năng khám phá module động làm cho hệ thống trở nên dễ quản lý và mở rộng. Việc tách biệt rõ ràng giữa các service, controller, và schema giúp duy trì tính modular và dễ bảo trì của ứng dụng.
