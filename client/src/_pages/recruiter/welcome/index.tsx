"use client";

import React from "react";
import { useRef } from "react";
import Navigation from "./components/navigation";
import HeroSection from "./components/hero-section";
import AboutSection from "./components/about-section";
import EcosystemSection from "./components/ecosystem-section";
import VerificationSection from "./components/verification-section";
import PricingSection from "./components/pricing-section";

export default function PageRecruiterWelcome() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="w-full">
      <Navigation
        onAboutClick={() => scrollToSection(aboutRef)}
        onEcosystemClick={() => scrollToSection(ecosystemRef)}
        onVerificationClick={() => scrollToSection(verificationRef)}
        onPricingClick={() => scrollToSection(pricingRef)}
      />
      <HeroSection
        onGetStarted={() => scrollToSection(pricingRef)}
        onConsult={() => scrollToSection(verificationRef)}
      />
      <div ref={aboutRef}>
        <AboutSection />
      </div>
      <div ref={ecosystemRef}>
        <EcosystemSection />
      </div>
      <div ref={verificationRef}>
        <VerificationSection />
      </div>
      <div ref={pricingRef}>
        <PricingSection />
      </div>
    </main>
  );
}
