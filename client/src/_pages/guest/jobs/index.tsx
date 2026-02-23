"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

export default function PageJobs() {
  const searchParams = useSearchParams();

  const keyword = searchParams.get("keyword") || "";
  const location = searchParams.get("location") || "";
  const industry = searchParams.get("industry") || "";

  return (
    <ul>
      <li>Keyword: {keyword}</li>
      <li>Location: {location}</li>
      <li>Industry: {industry}</li>
    </ul>
  );
}
