import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

//- Tạo hệ thống điều hướng dựa trên cấu hình routing đã định nghĩa
//- vì khi dùng Link của next-intl/navigation thì nó sẽ tự động thêm locale vào đường dẫn, ví dụ /vi/home hoặc /en/home
//- nên mình không cần phải lo về việc thêm locale vào đường dẫn khi sử dụng Link, nó sẽ tự động xử lý dựa trên cấu hình routing đã định nghĩa

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
