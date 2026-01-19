import React from "react";
import { cookies } from "next/headers";
import { envConfig } from "../../../../config";
import { UserResponseType } from "@/schemasvalidation/user";
import BlockSettings from "@/_pages/client/settings/BlockSettings";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const res = await fetch(
    `${envConfig.NEXT_PUBLIC_API_URL_SERVER}/auth/profile`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const user: UserResponseType = await res.json().then((res) => res.data.user);

  return <BlockSettings user={user} />;
}
