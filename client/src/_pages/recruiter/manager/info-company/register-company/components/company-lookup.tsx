"use client";

import React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCheckTaxIdExists } from "@/queries/useCompany";
import { useDebounce } from "use-debounce";
import { CompanyResType } from "@/schemasvalidation/company";

interface CompanyLookupProps {
  onLookup: (
    taxCode: string,
    company: CompanyResType | null,
    isNewCompany: boolean,
  ) => void;
}

export default function CompanyLookup({ onLookup }: CompanyLookupProps) {
  const [taxCode, setTaxCode] = useState("");
  const [error, setError] = useState("");

  const [debouncedTaxCode] = useDebounce(taxCode, 500);

  const {
    mutateAsync: checkTaxCodeExistsMutation,
    isPending: checkTaxCodeExistsLoading,
  } = useCheckTaxIdExists(debouncedTaxCode);

  const handleCheck = async () => {
    setError("");

    if (!taxCode.trim()) {
      setError("Vui lòng nhập mã số thuế");
      return;
    }

    if (taxCode.length !== 10) {
      setError("Mã số thuế phải có 10 chữ số");
      return;
    }
    try {
      const res = await checkTaxCodeExistsMutation();

      if (res?.isError) return;

      const existsCompany = res?.data?.company;

      onLookup(taxCode, existsCompany!, !existsCompany);
    } catch (error) {
      console.log("error check taxCode Exist: ", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <Card className="w-full max-w-md border-2 border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-accent/50 p-3 rounded-lg">
            <Search className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl">
          Kết nối với doanh nghiệp của bạn
        </CardTitle>
        <CardDescription className="text-base">
          Nhập mã số thuế để tiếp tục thiết lập tài khoản nhà tuyển dụng
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mã số thuế</label>
          <Input
            placeholder="0123456789"
            onKeyPress={handleKeyPress}
            onChange={(e) => setTaxCode(e.target.value)}
            maxLength={10}
            className="text-center text-lg tracking-widest"
          />
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleCheck}
          disabled={checkTaxCodeExistsLoading || !taxCode}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base"
        >
          {checkTaxCodeExistsLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Đang kiểm tra...
            </div>
          ) : (
            "Kiểm tra hệ thống"
          )}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Mã số thuế được sử dụng để xác định doanh nghiệp của bạn trong hệ
            thống
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
