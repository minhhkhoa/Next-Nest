"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  const steps = [
    { number: 1, title: "Thông tin cơ bản" },
    { number: 2, title: "Nhận diện thương hiệu" },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          {/* Step Circle */}
          <motion.div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step.number < currentStep
                ? "bg-accent text-accent-foreground"
                : step.number === currentStep
                  ? "bg-accent text-accent-foreground ring-4 ring-accent/30"
                  : "bg-secondary text-muted-foreground"
            }`}
            animate={{
              scale: step.number === currentStep ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {step.number < currentStep ? (
              <Check className="w-5 h-5" />
            ) : (
              step.number
            )}
          </motion.div>

          {/* Step Title */}
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium transition-colors ${
                step.number <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.title}
            </p>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <motion.div
              className="h-1 flex-1 mx-2 bg-secondary rounded-full"
              animate={{
                backgroundColor:
                  currentStep > step.number
                    ? "var(--color-accent)"
                    : "var(--color-secondary)",
              }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
