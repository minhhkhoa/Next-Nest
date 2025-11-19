"use client";

import { useGetListCategories } from "@/queries/useNewsCategory";
import Image from "next/image";

export default function CategoriesPage() {
  const { data: listCateNews } = useGetListCategories();

  return (
    <div>
      {/* header */}
      <div className="relative -mx-30 z-0">
        <Image
          src="/banner_CateNewsDashboard.webp"
          alt="logo"
          width={900}
          height={100}
          className="md:!w-[100vw] md:h-[350px] h-[200px] mt-3 object-cover"
        ></Image>

        <div className="absolute top-[84%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-center text-2xl font-bold text-primary ">
            Hành trang nghề nghiệp
          </p>
          <p className="hidden md:block text-center mt-2 text-gray-700 font-medium max-w-[690px] mx-auto">
            Khám phá thông tin hữu ích liên quan tới nghề nghiệp bạn quan tâm.
            Chia sẻ kinh nghiệm, kiến thức chuyên môn giúp bạn tìm được công
            việc phù hợp và phát triển bản thân.
          </p>
        </div>
      </div>
    </div>
  );
}
