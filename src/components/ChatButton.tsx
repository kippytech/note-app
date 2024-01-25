import React, { useState } from "react";
import ChatBox from "./ChatBox";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";

function ChatButton() {
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setChatBoxOpen(true)}>
        <Bot size={20} className="mr-2" />
        AI Chat
      </Button>
      <ChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />
    </>
  );
}

export default ChatButton;
