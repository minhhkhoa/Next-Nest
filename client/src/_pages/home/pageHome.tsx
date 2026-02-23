"use client";

import React from "react";
import HotJobsSection from "./components/HotJobsSection";
import JobsWithFilterSection from "./components/JobsWithFilterSection";
import AD from "./components/ad";
import SearchSection from "./components/SearchSection";
import TopCompaniesSection from "./components/TopCompaniesSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Khối Hero & Search */}
      <SearchSection />

      <AD />

      {/* Khối Công việc Nổi bật */}
      <HotJobsSection />

      <AD />

      {/* Khối Việc làm Mới nhất & Lọc */}
      <JobsWithFilterSection />

      <AD />

      {/* Khối Nhà tuyển dụng Hàng đầu */}
      <TopCompaniesSection />
    </div>
  );
}
