import RegisterForm from "@/_pages/auth/register/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <RegisterForm />
    </div>
  );
}
