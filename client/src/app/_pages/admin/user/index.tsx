"use client";

import { useGetAllUserByFilter } from "@/queries/useUser";
import React from "react";

export default function UserPageManagement() {
  const { data: listUser } = useGetAllUserByFilter({
    currentPage: 1,
    pageSize: 10,
  });

  console.log("listUser: ", listUser);
  return <div>index</div>;
}
