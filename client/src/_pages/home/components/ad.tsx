import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import React from "react";

//- Component quảng cáo đơn giản

export function ADHorizontal() {
  const t = useTranslations("PageHome.AD");
  return (
    <Card className="p-6 bg-red-50 rounded-2xl">
      <div className="text-center py-4">
        <div className="text-4xl mb-2 animate-bounce">🔥</div>
        <h3 className="text-lg font-bold text-red-600 mb-1">{t("Title")}</h3>
        <p className="text-sm text-red-500/80 mb-4  mx-auto">
          {t("Description")}
        </p>
        <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none">
          {t("Button")}
        </Button>
      </div>
    </Card>
  );
}

export function ADVertical() {
  const t = useTranslations("PageHome.AD");
  return (
    <Card className="p-6 bg-red-50 rounded-2xl">
      <CardContent className="p-0">
        <div className="w-full h-[500px] flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-2 animate-bounce">🔥</div>
          <h3 className="text-lg font-bold text-red-600 mb-1">{t("Title")}</h3>
          <p className="text-sm text-red-500/80 mb-4  mx-auto">
            {t("Description")}
          </p>
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none">
            {t("Button")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
