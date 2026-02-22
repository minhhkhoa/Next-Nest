"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTreeIndustry } from "@/queries/useIndustry";
import { convertToSlug } from "@/lib/utils";

export default function HeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");

  // Fetch industries for dropdown
  const { data: industryData } = useGetTreeIndustry({}); 
  // Assuming data structure based on previous context, potentially tree structure flattened or direct list needed
  // If tree, we might need a flattener specific to this usage or just use top level

  const industries = industryData?.data || [];

  useEffect(() => {
    // Sync URL params to state on load/change
    if(searchParams.get("keyword")) setKeyword(searchParams.get("keyword")!);
    if(searchParams.get("location")) setLocation(searchParams.get("location")!);
    // Industry sync is harder if URL uses slug but Select uses ID.
    // If we use slug in Select value, we can sync directly if URL has slug as path param
    // But this component might be mounted on home page "/" without path params. x
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);

    if (industry) {
      // Find the selected industry object to get its name for slug generation
      // If industry state holds the ID
       const selectedIndustry = industries.find(item => item._id === industry);
       let path = "/jobs"; // Default
       if(selectedIndustry) {
          const slug = convertToSlug(selectedIndustry.name?.vi || "");
          path = `/${slug}`;
       }
       
       const queryString = params.toString();
       router.push(`${path}${queryString ? `?${queryString}` : ""}`);

    } else {
        const queryString = params.toString();
        router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
    }
  };
  
  // Flattening or using the tree directly? Simplest is top level for now, or if flattenTree exists in utils
  // I saw flattenTree in utils.ts earlier!
  // Let's use flattenTree if available or just map basic array if it's flat.
  // The query was `useGetTreeIndustry`, likely nested. 

  return (
    <div className="bg-background py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-hero.png')] bg-cover bg-center opacity-10 pointer-events-none dark:opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          Tìm kiếm công việc mơ ước của bạn <br className="hidden md:block" />
          với hàng nghìn cơ hội hấp dẫn
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          Khám phá cơ hội nghề nghiệp tốt nhất từ các công ty hàng đầu. 
          Kết nối với nhà tuyển dụng uy tín và phát triển sự nghiệp của bạn ngay hôm nay.
        </p>

        <div className="bg-card p-4 rounded-xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row gap-4 items-center animate-in fade-in zoom-in duration-700 delay-200 border">
          
          {/* Keyword Search */}
          <div className="flex-1 w-full flex items-center border-b md:border-b-0 md:border-r border-border px-2">
            <Search className="text-muted-foreground w-5 h-5 mr-2" />
            <Input 
              placeholder="Vị trí, Từ khóa..." 
              className="border-none shadow-none focus-visible:ring-0 px-0 text-base"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Industry Select */}
         <div className="flex-1 w-full flex items-center border-b md:border-b-0 md:border-r border-border px-2">
            <Briefcase className="text-muted-foreground w-5 h-5 mr-2" />
             <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="border-none shadow-none focus:ring-0 px-0 text-base w-full text-left font-normal text-muted-foreground">
                    <SelectValue placeholder="Ngành nghề" />
                </SelectTrigger>
                <SelectContent>
                    {industries.map((ind: any) => (
                        <SelectItem key={ind._id} value={ind._id}>
                            {ind.name?.vi || ind.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          {/* Location Select (Mock for now or use constants) */}
          <div className="flex-1 w-full flex items-center px-2">
            <MapPin className="text-muted-foreground w-5 h-5 mr-2" />
            <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="border-none shadow-none focus:ring-0 px-0 text-base w-full text-left font-normal text-muted-foreground">
                   <SelectValue placeholder="Địa điểm" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ha-noi">Hà Nội</SelectItem>
                    <SelectItem value="ho-chi-minh">Hồ Chí Minh</SelectItem>
                    <SelectItem value="da-nang">Đà Nẵng</SelectItem>
                    <SelectItem value="can-tho">Cần Thơ</SelectItem>
                    <SelectItem value="khac">Khác</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full md:w-auto px-8 py-6 rounded-lg text-lg font-medium transition-all"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>

        </div>
        
        <div className="mt-8 flex gap-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
            <span>Phổ biến:</span>
            <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => { setKeyword('Marketing'); handleSearch(); }}>Marketing</span>
            <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => { setKeyword('Developer'); handleSearch(); }}>Developer</span>
            <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => { setKeyword('Designer'); handleSearch(); }}>Designer</span>
        </div>
      </div>
    </div>
  );
}
