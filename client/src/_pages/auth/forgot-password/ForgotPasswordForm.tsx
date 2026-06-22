"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useForgotPassword } from "@/queries/useAuth";
import { useTranslations } from "next-intl";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const { mutateAsync: forgotPasswordMutate, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(t("EnterEmail"));
      return;
    }

    try {
      const res = await forgotPasswordMutate(email);

      if (res.isError) return;
      setMessage(res?.data?.message as string);
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setError("");
      setEmail("");
    }
  };

  return (
    <>
      {message && <i className="text-sm text-white">{message}</i>}
      <form onSubmit={handleSubmit} className={`space-y-4`} noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t("EmailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full"
          />
          {!!error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Processing")}
            </>
          ) : (
            t("ForgotPasswordConfirm")
          )}
        </Button>

        <div className="flex justify-between">
          <Link href="/login" className="text-sm text-white hover:text-primary">
            {t("BackToLogin")}
          </Link>
          <Link href="/register" className="text-sm text-white hover:text-primary">
            {t("RegisterNow")}
          </Link>
        </div>
      </form>
    </>
  );
}
