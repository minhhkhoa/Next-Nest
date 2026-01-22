"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyLookup from "./components/company-lookup";
import CreateCompanyForm from "./components/create-company-form";
import JoinCompanyCard from "./components/join-company-card";

export type SetupState = "initial" | "create" | "join";

export interface CompanyData {
  taxId: string;
  companyName?: string;
  address?: string;
  logo?: string;
}

export default function CompanySetupPage() {
  const [state, setState] = useState<SetupState>("initial");
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  const handleLookup = (taxId: string, isNewCompany: boolean) => {
    setCompanyData({ taxId });
    setState(isNewCompany ? "create" : "join");
  };

  const handleCreateSuccess = () => {
    setState("initial");
    setCompanyData(null);
  };

  const handleBack = () => {
    setState("initial");
    setCompanyData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {state === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* check mst */}
            <CompanyLookup onLookup={handleLookup} />
          </motion.div>
        )}

        {state === "create" && companyData && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl"
          >
            {/* nếu mst chưa tồn tại thì vào màn này */}
            <CreateCompanyForm
              initialTaxId={companyData.taxId}
              onSuccess={handleCreateSuccess}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {state === "join" && companyData && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* nếu mst đã tồn tại thì vào màn này */}
            <JoinCompanyCard company={companyData} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
