export const LEVEL_OPTIONS = [
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

export enum Gender {
  Boy = "Nam",
  Girl = "Nữ",
  Other = "Khác",
}

export const ADDRESS_OPTIONS = [
  //- 6 thành phố trực thuộc trung ương
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Thủ Đức",

  //- 28 tỉnh
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Đắk Lắk",
  "Đắk Nông",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nam",
  "Hà Tĩnh",
  "Hậu Giang",
  "Khánh Hòa",
  "Kiên Giang",
  "Lâm Đồng",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Nam",
  "Quảng Ngãi",
  "Thanh Hóa",
];

export const segmentNameMap: Record<string, string> = {
  // -start page public
  "cate-news": "Hành trang nghề nghiệp",
  news: "Tin tức",
  profile: "Trang cá nhân",
  settings: "Cài đặt",
  // - end page public
};
