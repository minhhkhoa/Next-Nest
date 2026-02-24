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
import { Link } from "@/i18n/navigation";
import React from "react";
import { useTranslations } from "next-intl";

export default function SheetMobile() {
  const t = useTranslations("Header.NavigateHeader");
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
          <Link href={"/recruiter/welcome"}>{t("SheetButton")}</Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}

function NavItemSheetMobile() {
  const { data: listCateNews } = useGetListCategories();
  const t = useTranslations("Header.NavigateHeader");

  return (
    <div>
      <Link href="/">{t("Home")}</Link>
      <div className="mr-5">
        {/* viec lam */}
        <div className="">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <span>{t("Jobs")}</span>
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
                <Link href="/cv-templates">{t("CreateCv.Title")}</Link>
                <div className="flex-1">
                  <AccordionTrigger className="flex-1 justify-end" />
                </div>
              </div>
              <AccordionContent className="flex flex-col gap-4 text-balance ml-5">
                <Link href="/cv-templates">{t("CreateCv.Item1.Title")}</Link>
                <Link href="/cv-templates">{t("CreateCv.Item2.Title")}</Link>
                <Link href="/cv-templates">{t("CreateCv.Item3.Title")}</Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Hành trang nghề ngiệp */}
        <div className="">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <div className="flex items-center justify-between">
                <Link href="/cate-news">{t("Career")}</Link>
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
