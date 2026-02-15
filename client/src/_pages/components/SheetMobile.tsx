"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { generateSlugUrl } from "@/lib/utils";
import { useGetListCategories } from "@/queries/useNewsCategory";
import { Menu } from "lucide-react";
import Link from "next/link";
import React from "react";
import AppLogo from "./AppLogo";

export default function SheetMobile() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetTitle></SheetTitle>
        <nav className="grid gap-6 text-lg font-medium ml-5">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg">
              <video
                src="/videos/video_logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </div>

            <Link href="/" className=" text-lg font-semibold">
              JobHub
            </Link>
          </div>
          <NavItemSheetMobile />
        </nav>
        <Button className="mx-4">
          <Link href={"/recruiter/welcome"}>Đăng tin tuyển dụng</Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}

function NavItemSheetMobile() {
  const { data: listCateNews } = useGetListCategories();

  return (
    <div>
      <Link href="/">Trang chủ</Link>
      <div className="mr-5">
        {/* viec lam */}
        <div className="">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <span>Việc làm</span>
                <div className="flex-1">
                  <AccordionTrigger className="flex-1 justify-end" />
                </div>
              </div>
              <AccordionContent className="flex flex-col gap-4 text-balance ml-5">
                <p>Text1</p>
                <p>Text2</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Tao cv */}
        <div className="">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <Link href="/cv-templates">Tạo cv</Link>
                <div className="flex-1">
                  <AccordionTrigger className="flex-1 justify-end" />
                </div>
              </div>
              <AccordionContent className="flex flex-col gap-4 text-balance ml-5">
                <Link href="/cv-templates">Danh sách mẫu cv</Link>
                <Link href="/cv-templates">Cv dành cho lập trình viên</Link>
                <Link href="/cv-templates">Cv dành cho kế toán</Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Hành trang nghề ngiệp */}
        <div className="">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <Link href="/cate-news">Hành trang nghề ngiệp</Link>
                <div className="flex-1">
                  <AccordionTrigger className="flex-1 justify-end" />
                </div>
              </div>
              <AccordionContent className="flex flex-col gap-4 text-balance ml-5">
                <ul className="grid gap-2">
                  {listCateNews?.data?.map((item) => (
                    <li key={item._id} className="">
                      <Link
                        href={`/cate-news/${generateSlugUrl({
                          name: item.slug.vi,
                          id: item._id,
                        })}`}
                      >
                        <div className="font-medium !whitespace-nowrap">
                          {item.name.vi}
                        </div>
                        <Separator className="my-1.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
