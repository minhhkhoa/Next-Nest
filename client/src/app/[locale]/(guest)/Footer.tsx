"use client";

import type React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Facebook,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";


interface FooterLink {
  title: string;
  links: string[];
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}


export default function Footer() {
  const t = useTranslations("Footer");

  const footerLinks: FooterLink[] = [
    {
      title: t("findJobs.title"),
      links: [
        t("findJobs.allJobs"),
        t("findJobs.newJobs"),
        t("findJobs.topCompanies"),
        t("findJobs.categories"),
      ],
    },
    {
      title: t("forCompany.title"),
      links: [
        t("forCompany.postJob"),
        t("forCompany.services"),
        t("forCompany.findCandidates"),
        t("forCompany.guide"),
      ],
    },
    {
      title: t("aboutUs.title"),
      links: [
        t("aboutUs.blog"),
        t("aboutUs.events"),
        t("aboutUs.community"),
        t("aboutUs.contact"),
      ],
    },
    {
      title: t("support.title"),
      links: [
        t("support.helpCenter"),
        t("support.terms"),
        t("support.privacy"),
        t("support.security"),
      ],
    },
  ];
  
  const socialLinks: SocialLink[] = [
    {
      icon: <Linkedin size={20} />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    { icon: <Github size={20} />, href: "https://github.com", label: "GitHub" },
    {
      icon: <Twitter size={20} />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <Facebook size={20} />,
      href: "https://facebook.com",
      label: "Facebook",
    },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <footer className="bg-primary/5 dark:bg-primary-dark/5">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary">{t("brand.title")}</h2>
              <p className="mt-2 text-sm ">
                {t("brand.description")}
              </p>
            </div>

            {/* Social icons */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-all duration-300 hover:bg-accent hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={handleLinkClick}
                      className="cursor-pointer text-left text-sm transition-colors duration-200 hover:text-primary"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <Separator className="my-12 border-t border-primary-foreground/10" />

        {/* Bottom section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Contact info */}
          <div className="flex flex-4 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-primary" />
              <a
                href={`mailto:${t("contact.email")}`}
                className="text-sm transition-colors duration-200 hover:text-primary"
              >
                {t("contact.email")}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-primary" />
              <a
                href="tel:+84123456789"
                className="text-sm transition-colors duration-200 hover:text-primary"
              >
                {t("contact.phone")}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <span className="text-sm">
                {t("contact.address")}
              </span>
            </div>
          </div>

          {/* map */}
          <div className="flex-4 h-[200px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6376143503944!2d105.82223027431664!3d21.007158680636717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac8109765ba5%3A0xd84740ece05680ee!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUaOG7p3kgbOG7o2k!5e0!3m2!1svi!2s!4v1763820232822!5m2!1svi!2s"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <Separator className="mt-12"/>

        {/* Copyright */}
        <div className="text-center text-sm py-5">
          <b>{t("copyright")}</b>
        </div>
      </div>
    </footer>
  );
}
