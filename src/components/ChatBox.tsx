import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ChatBoxProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatBox({ open, onClose }: ChatBoxProps) {
  const { data, isLoading: isLoadingPrevMssgs } = useQuery({
    queryKey: ["chatMssg"],
    queryFn: async () => {
      const res = await axios.get("/api/getMessages");
      return res.data;
    },
  });
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat({ initialMessages: data || [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-36",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={onClose} className="mx-auto mb-1 block">
        <XCircle size={30} />
      </button>
      <div className="flex h-[calc(100vh-4rem)] flex-col rounded border-2 bg-background shadow-xl">
        <div className="h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((mssg) => (
            <ChatMessage message={mssg} key={mssg.id} />
          ))}
          {isLoading && isLoadingPrevMssgs && lastMessageIsUser && (
            <ChatMessage
              message={{ role: "assistant", content: "Brainy is thinking..." }}
            />
          )}
          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something went wrong. Please try again.",
              }}
            />
          )}
          {!error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              <Bot />
              Ask the AI a question about your notes.
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-1">
          <Button
            onClick={() => setMessages([])}
            title="Clear chat"
            variant="outline"
            size="icon"
            className="shrink-0"
            type="button"
          >
            <Trash />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Chat..."
            ref={inputRef}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const { user } = useUser();

  const isAIMessage = role === "assistant";
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAIMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    >
      {isAIMessage && <Bot className="mr-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border px-3 py-2",
          isAIMessage ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
      {!isAIMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="user image"
          width={40}
          height={40}
          className="ml-2 aspect-square rounded-full"
        />
      )}
    </div>
  );
}
