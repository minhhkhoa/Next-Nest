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
  const footerLinks: FooterLink[] = [
    {
      title: "Tìm việc",
      links: [
        "Tất cả việc làm",
        "Việc làm mới",
        "Công ty hàng đầu",
        "Danh mục việc",
      ],
    },
    {
      title: "Dành cho công ty",
      links: ["Đăng tuyển", "Gói dịch vụ", "Tìm ứng viên", "Hướng dẫn"],
    },
    {
      title: "Về chúng tôi",
      links: ["Blog", "Sự kiện", "Cộng đồng", "Liên hệ"],
    },
    {
      title: "Hỗ trợ",
      links: [
        "Trung tâm trợ giúp",
        "Điều khoản",
        "Chính sách riêng tư",
        "Bảo mật",
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Brand section */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary">JobHub</h2>
              <p className="mt-2 text-sm ">
                Nền tảng tuyển dụng hàng đầu kết nối ứng viên xuất sắc với những
                cơ hội việc làm tốt nhất
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
        <div className="my-12 border-t border-primary-foreground/10"></div>

        {/* Bottom section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Contact info */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-primary" />
              <a
                href="mailto:hello@jobhub.com"
                className="text-sm transition-colors duration-200 hover:text-primary"
              >
                hello@jobhub.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-primary" />
              <a
                href="tel:+84123456789"
                className="text-sm transition-colors duration-200 hover:text-primary"
              >
                +84 (0) 123 456 789
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <span className="text-sm">
                123 Đường Tuyển Dụng, Hà Nội, Việt Nam
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm md:text-right">
            <p>&copy; 2025 JobHub. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>

      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent to-accent/50"></div>
    </footer>
  );
}
