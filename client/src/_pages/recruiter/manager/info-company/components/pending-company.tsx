import React from "react";
import {
  Clock,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserResponseType } from "@/schemasvalidation/user";

const PendingCompanyPage = ({ user }: { user: UserResponseType }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="max-w-[550px] w-full border-2 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đang chờ phê duyệt
          </CardTitle>
          <CardDescription className="text-base">
            Hồ sơ doanh nghiệp của bạn đang được xử lý
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chào {user.name}, đội ngũ quản trị viên đã tiếp nhận yêu cầu đăng ký của
              bạn. Quá trình xác thực thường diễn ra trong vòng
              <span className="font-semibold text-foreground mx-1">
                24h - 48h
              </span>{" "}
              làm việc.
            </p>
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="px-3 py-1 gap-2 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Trạng thái: Đang kiểm tra
            </Badge>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 text-left border border-border">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Tính bảo mật dữ liệu</p>
              <p className="text-xs text-muted-foreground leading-snug">
                Thông tin mã số thuế và pháp lý được mã hóa và chỉ dùng cho mục
                đích xác minh doanh nghiệp.
              </p>
            </div>
          </div>
        </CardContent>

        <Separator className="my-2" />

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full gap-2" size="lg">
            <RefreshCw className="w-4 h-4" /> Làm mới trạng thái
          </Button>

          <Button variant="link" className="text-xs text-muted-foreground mt-2">
            Tìm hiểu quy trình phê duyệt{" "}
            <ExternalLink className="ml-1 w-3 h-3" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PendingCompanyPage;
