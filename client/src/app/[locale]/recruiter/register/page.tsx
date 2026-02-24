import RecruiterRegisterForm from "@/_pages/recruiter/register";
import React from "react";

export default function RecruiterRegisterPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <RecruiterRegisterForm />
    </div>
  );
}
