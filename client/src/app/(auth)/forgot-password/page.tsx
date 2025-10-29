import ForgotPasswordForm from "@/app/_pages/auth/forgot-password/ForgotPasswordForm";
import { Separator } from "@/components/ui/separator";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Quên mật khẩu?</h1>
          <p className="text-muted-foreground">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>
        <ForgotPasswordForm />
        <Separator className="my-4" />
        <p>
          Bằng việc thực hiện đổi mật khẩu, bạn đã đồng ý với{" "}
          <span className="text-primary">Điều khoản dịch vụ</span> {" "}
          và <span className="text-primary">Chính sách bảo mật</span> của chúng tôi.
        </p>
      </div>
    </div>
  );
}
