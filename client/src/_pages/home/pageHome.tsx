"use client";

import React from "react";
import HeroSection from "./components/HeroSection";
import HotJobsSection from "./components/HotJobsSection";
import JobsWithFilterSection from "./components/JobsWithFilterSection";
import TopBrandsSection from "./components/TopBrandsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Khối Hero & Search */}
      <HeroSection />
      
      {/* Khối Công việc Nổi bật */}
      <HotJobsSection />
      
      {/* Khối Việc làm Mới nhất & Lọc */}
      <JobsWithFilterSection />
      
      {/* Khối Nhà tuyển dụng Hàng đầu */}
      <TopBrandsSection />
    </div>
  );
}
