import slugifyLib from 'slugify';

export const slugify = (text: string): string => {
  return slugifyLib(text, {
    replacement: '-', // thay khoảng trắng bằng '-'
    remove: /[*+~.()'"!:@]/g, // loại bỏ ký tự đặc biệt
    lower: true, // chuyển về chữ thường
    strict: true, // xóa ký tự không phải alphabet/số
    locale: 'vi', // xử lý tiếng Việt cực chuẩn (đ -> d,...)
    trim: true,
  });
};

//- Hàm tạo MultiLang Slug
export const generateMultiLangSlug = (title: { vi: string; en: string }) => {
  return {
    vi: `${slugify(title.vi)}`,
    en: `${slugify(title.en)}`,
  };
};
