import LoginForm from "@/_pages/auth/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <LoginForm />
    </div>
  );
}
