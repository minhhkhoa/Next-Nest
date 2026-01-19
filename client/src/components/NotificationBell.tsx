// "use client";

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { Bell } from "lucide-react";
// import { accessInstance } from "@/lib/http";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { formatDistanceToNow } from "date-fns";
// import { vi } from "date-fns/locale";
// import { useAppStore } from "./TanstackProvider";

// export default function NotificationBell() {
//   const { isLogin, socket } = useAppStore();
//   const queryClient = useQueryClient();

//   // 1. Lấy số lượng thông báo chưa đọc
//   const { data: unreadData } = useQuery({
//     queryKey: ["notifications-count"],
//     queryFn: async () => {
//       const res = await accessInstance.get("/notifications/count-unread");
//       return res.data; // Giả sử backend trả về: { count: 10 }
//     },
//     enabled: isLogin,
//   });

//   // 2. Lấy danh sách 10 thông báo mới nhất để hiện trong Popover
//   const { data: notifications } = useQuery({
//     queryKey: ["notifications-latest"],
//     queryFn: async () => {
//       const res = await accessInstance.get(
//         "/notifications?pageSize=10&currentPage=1"
//       );
//       return res.result;
//     },
//     enabled: isLogin,
//   });

//   // 3. Đánh dấu đã đọc
//   const handleMarkAsRead = async (id: string) => {
//     try {
//       await accessInstance.patch(`/notifications/${id}`);
//       // Refresh lại cả số lượng và danh sách
//       queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
//       queryClient.invalidateQueries({ queryKey: ["notifications-latest"] });
//     } catch (error) {
//       console.error("Lỗi khi đánh dấu đã đọc:", error);
//     }
//   };

//   const unreadCount = unreadData?.count || 0;

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <div className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all">
//           <Bell className="h-6 w-6 text-gray-600" />
//           {unreadCount > 0 && (
//             <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
//               {unreadCount > 99 ? "99+" : unreadCount}
//             </span>
//           )}
//         </div>
//       </PopoverTrigger>

//       <PopoverContent className="w-80 p-0" align="end">
//         <div className="flex items-center justify-between border-b p-4">
//           <h4 className="font-semibold">Thông báo</h4>
//           {unreadCount > 0 && (
//             <span className="text-xs text-blue-600 hover:underline cursor-pointer">
//               Đánh dấu tất cả đã đọc
//             </span>
//           )}
//         </div>

//         <ScrollArea className="h-[400px]">
//           {notifications && notifications.length > 0 ? (
//             notifications.map((item: any) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleMarkAsRead(item._id)}
//                 className={`flex flex-col gap-1 border-b p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
//                   !item.isRead ? "bg-blue-50/50" : ""
//                 }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <p
//                     className={`text-sm ${!item.isRead ? "font-bold" : "font-medium"}`}
//                   >
//                     {item.title.vi}
//                   </p>
//                   {!item.isRead && (
//                     <div className="h-2 w-2 rounded-full bg-blue-600" />
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-500 line-clamp-2">
//                   {item.content.vi}
//                 </p>
//                 <p className="text-[10px] text-gray-400 mt-1">
//                   {formatDistanceToNow(new Date(item.createdAt), {
//                     addSuffix: true,
//                     locale: vi,
//                   })}
//                 </p>
//               </div>
//             ))
//           ) : (
//             <div className="flex h-40 items-center justify-center text-sm text-gray-500">
//               Không có thông báo nào
//             </div>
//           )}
//         </ScrollArea>

//         <div className="border-t p-2 text-center">
//           <button className="text-xs text-blue-600 hover:font-bold transition-all">
//             Xem tất cả thông báo
//           </button>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }
