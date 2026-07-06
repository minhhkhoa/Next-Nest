import ChatPageModule from "@/_pages/pages_authenticated/chat";
import React from "react";

export default function ChatPage() {
  return (
    <div className="py-0 md:py-3 flex-grow flex flex-col min-h-0">
      <ChatPageModule />
    </div>
  );
}
