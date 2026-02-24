import ForgotPasswordForm from "@/_pages/auth/forgot-password/ForgotPasswordForm";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="max-w-md mx-auto p-5">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Quên mật khẩu?</h1>
          <p className="text-muted-foreground">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>
        <ForgotPasswordForm />
        <Separator />
        <p>
          Bằng việc thực hiện đổi mật khẩu, bạn đã đồng ý với{" "}
          <span className="text-primary">Điều khoản dịch vụ</span> và{" "}
          <span className="text-primary">Chính sách bảo mật</span> của chúng
          tôi.
        </p>
      </Card>
    </div>
  );
}
