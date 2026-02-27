"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useGetJobsFilter, useRequestHotJob } from "@/queries/useJob";
import { JobResType } from "@/schemasvalidation/job";
import { format } from "date-fns";
import { Loader2, Flame, Send } from "lucide-react";
import { useDebounce } from "use-debounce";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { SearchBar } from "@/_pages/admin/NewsCategory/components/search-bar";

export default function PageRecruiterGetHot() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [selectedJob, setSelectedJob] = useState<JobResType | null>(null);
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: jobsData, isLoading } = useGetJobsFilter({
    currentPage: 1,
    pageSize: 10,
    title: debouncedSearch,
    isActive: "true",
    status: "active",
    isDeleted: "false",
  });

  const requestHotMutation = useRequestHotJob();

  const handleRequestHot = (job: JobResType) => {
    setSelectedJob(job);
    setDescription("");
    setIsDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedJob) return;
    if (!description.trim()) {
      SoftDestructiveSonner("Vui lòng nhập lý do/mô tả yêu cầu!");
      return;
    }

    try {
      await requestHotMutation.mutateAsync({
        targetId: selectedJob._id,
        description: description,
      });
      SoftSuccessSonner("Gửi yêu cầu thành công!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      SoftDestructiveSonner("Gửi yêu cầu thất bại!");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Quản lý Job Hot
        </h1>
        <div className="w-72">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề công việc</TableHead>
              <TableHead>Trạng thái hiện tại</TableHead>
              <TableHead>Thời hạn Hot</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : !jobsData?.data?.result || jobsData.data.result.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không tìm thấy công việc nào.
                </TableCell>
              </TableRow>
            ) : (
              jobsData.data.result.map((job: JobResType) => (
                <TableRow key={job._id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">
                      {job.title?.vi || job.title?.en || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.isHot?.isHotJob ? (
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        Đang Hot (Đến{" "}
                        {job.isHot.hotUntil
                          ? format(new Date(job.isHot.hotUntil), "dd/MM/yyyy")
                          : "?"}
                        )
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Bình thường</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* This column is redundant if I put date in badge, but good for table view */}
                    {job.isHot?.isHotJob && job.isHot.hotUntil
                      ? format(new Date(job.isHot.hotUntil), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={job.isHot?.isHotJob ? "outline" : "default"}
                      onClick={() => handleRequestHot(job)}
                    >
                      {job.isHot?.isHotJob ? "Gia hạn Hot" : "Xin lên Hot"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu Hot cho công việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedJob && (
              <div className="p-3 bg-muted rounded-md border text-sm">
                <strong>Job:</strong>{" "}
                {selectedJob.title?.vi || selectedJob.title?.en}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bổ sung lý do / Ghi chú cho Admin:
              </label>
              <Textarea
                placeholder="Ví dụ: Cần tuyển gấp vị trí này trong tuần sau..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
              disabled={requestHotMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={requestHotMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {requestHotMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Send className="w-4 h-4 mr-2" />
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
