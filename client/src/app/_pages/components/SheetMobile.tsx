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
import { useGetListCategories } from "@/queries/useNewsCategory";
import { Menu, Package2 } from "lucide-react";
import Link from "next/link";
import React from "react";

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
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Find Job</span>
          </Link>

          <NavItemSheetMobile />
        </nav>
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
                <span>Tạo cv</span>
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
                <ul className="grid w-[200px] gap-2">
                  {listCateNews?.data?.map((item) => (
                    <li key={item._id} className="">
                      <Link href={`/cate-news/${item.slug.vi}`}>
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
