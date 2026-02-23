"use client";

import React from "react";
import HotJobsSection from "./components/HotJobsSection";
import JobsWithFilterSection from "./components/JobsWithFilterSection";
import { ADHorizontal } from "./components/ad";
import SearchSection from "./components/SearchSection";
import TopCompaniesSection from "./components/TopCompaniesSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Khối Hero & Search */}
      <SearchSection />

      <ADHorizontal />

      {/* Khối Công việc Nổi bật */}
      <HotJobsSection />

      <ADHorizontal />

      {/* Khối Việc làm Mới nhất & Lọc */}
      <JobsWithFilterSection />

      <ADHorizontal />

      {/* Khối Nhà tuyển dụng Hàng đầu */}
      <TopCompaniesSection />
    </div>
  );
}
