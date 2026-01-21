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

interface CompanyLookupProps {
  onLookup: (taxId: string, isNewCompany: boolean) => void;
}

// Mock data - mã số thuế tồn tại
const EXISTING_TAX_IDS = ["0123456789", "9876543210"];

export default function CompanyLookup({ onLookup }: CompanyLookupProps) {
  const [taxId, setTaxId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    setError("");

    if (!taxId.trim()) {
      setError("Vui lòng nhập mã số thuế");
      return;
    }

    if (taxId.length !== 10) {
      setError("Mã số thuế phải có 10 chữ số");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    const isExisting = EXISTING_TAX_IDS.includes(taxId);
    onLookup(taxId, !isExisting);
    setIsLoading(false);
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
            value={taxId}
            onChange={(e) => {
              setTaxId(e.target.value.replace(/\D/g, "").slice(0, 10));
              setError("");
            }}
            onKeyPress={handleKeyPress}
            maxLength={10}
            disabled={isLoading}
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
          disabled={isLoading || !taxId}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base"
        >
          {isLoading ? (
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
