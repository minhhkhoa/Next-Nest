"use client";

import React from "react";
import HeroSection from "./components/HeroSection";
import HotJobsSection from "./components/HotJobsSection";
import JobsWithFilterSection from "./components/JobsWithFilterSection";
import TopBrandsSection from "./components/TopBrandsSection";
import AD from "./components/ad";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Khối Hero & Search */}
      <HeroSection />

      <AD />

      {/* Khối Công việc Nổi bật */}
      <HotJobsSection />

      <AD />

      {/* Khối Việc làm Mới nhất & Lọc */}
      <JobsWithFilterSection />

      <AD />

      {/* Khối Nhà tuyển dụng Hàng đầu */}
      <TopBrandsSection />
    </div>
  );
}
