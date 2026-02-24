import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * file này có tác dung lấy dữ liệu i18n cho toàn bộ app, nó sẽ được gọi mỗi khi có request đến server
 * và trả về dữ liệu i18n tương ứng với locale của request đó
 * hiện tại mình đang để locale tĩnh là "vi" nhưng sau này sẽ thay đổi để lấy từ request header hoặc cookie
 * dữ liệu i18n được lưu trong thư mục messages, mỗi file json sẽ tương ứng với một locale
 * ví dụ messages/vi.json sẽ chứa dữ liệu i18n cho tiếng Việt
 * khi có request đến server, hàm này sẽ được gọi và trả về dữ liệu i18n tương ứng với locale của request đó
 * sau đó dữ liệu này sẽ được truyền vào context của app để các component có thể sử dụng
 * locals: là locale của request, ví dụ "vi" hoặc "en"
 * messages: là dữ liệu i18n tương ứng với locale đó, được lấy từ file json trong thư mục messages
 */

export default getRequestConfig(async ({ requestLocale }) => {
  //- lấy locale từ request header
  const requested = await requestLocale;

  //- Kiểm tra xem locale được yêu cầu có nằm trong danh sách locales được định nghĩa trong routing hay không
  //- nếu có thì sử dụng locale đó, nếu không thì sử dụng defaultLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  //- trả về dữ liệu i18n tương ứng với locale đó, dữ liệu này sẽ được truyền vào context của app để các component có thể sử dụng
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
