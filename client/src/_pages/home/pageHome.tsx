import React from "react";
import HotJobsSection from "./components/HotJobsSection";
import JobsWithFilterSection from "./components/JobsWithFilterSection";
import {
  AdBannerInline,
  AdOverlayPopup,
} from "../../components/ads/AdSlotRenderer";
import SearchSection from "./components/SearchSection";
import TopCompaniesSection from "./components/TopCompaniesSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Khối Hero & Search */}
      <SearchSection />

      <div className="container mx-auto py-6">
        <AdBannerInline slotCode="HOME_TOP" />
      </div>

      {/* Khối Công việc Nổi bật */}
      <HotJobsSection />

      <div className="container mx-auto py-6">
        <AdBannerInline slotCode="HOME_MIDDLE" />
      </div>

      {/* Khối Việc làm Mới nhất & Lọc */}
      <JobsWithFilterSection />

      <div className="container mx-auto py-6">
        <AdBannerInline slotCode="HOME_BOTTOM" />
      </div>

      {/* Khối Nhà tuyển dụng Hàng đầu */}
      <TopCompaniesSection />

      {/* Quảng cáo dạng Popup ở góc màn hình */}
      <AdOverlayPopup slotCode="HOME_POPUP" />
    </div>
  );
}
