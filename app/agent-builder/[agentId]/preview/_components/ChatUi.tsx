"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon, RefreshCcwIcon, Send } from "lucide-react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
type Props = {
  GenerateAgentToolConfig: () => void;
  loading: boolean;
  agentDetail: any;
  conversationId: string | null;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function ChatUi({
  GenerateAgentToolConfig,
  loading,
  agentDetail,
  conversationId,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome-msg", role: "assistant", content: "Welcome! This is a demo chat." },
  ]);

  const makeId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const OnSendMsg = async () => {
    if (!userInput.trim() || loadingMsg) return;

    setLoadingMsg(true);

    const currentInput = userInput;
    const userMessage: Message = { id: makeId(), role: "user", content: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    const assistantId = makeId();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const safeConversationId =
        typeof conversationId === "string" && conversationId.startsWith("conv")
          ? conversationId
          : undefined;

      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agentDetail?.name,
          agents: agentDetail?.config?.agents || [],
          tools: agentDetail?.config?.tools || [],
          input: currentInput,
          conversationId: safeConversationId,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed: ${res.status}`);
      }

      // Works for both streamed and plain-text responses
      if (!res.body) {
        const text = await res.text();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, content: text } : msg))
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Something went wrong. Please try again." }
            : msg
        )
      );
    } finally {
      setLoadingMsg(false);
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="flex justify-between items-center border-b p-4">
        <h2 className="font-medium">{agentDetail?.name || "Agent"}</h2>
        <Button
          onClick={GenerateAgentToolConfig}
          disabled={loading}
          size="icon"
          variant="outline"
        >
          <RefreshCcwIcon className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex p-2 rounded-b-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 text-black self-start"
            }`}
          >
            <div className="break-words whitespace-pre-wrap overflow-hidden text-sm">
              <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
            </div>
          </div>
          
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          OnSendMsg();
        }}
        className="border-t p-4 flex items-center gap-2"
      >
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              OnSendMsg();
            }
          }}
          placeholder="Type your message here..."
          className="flex-1 resize-none border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 max-h-[100px]"
        />

        <Button type="submit" disabled={loadingMsg}>
          {loadingMsg ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}

export { ChatUi };
export default ChatUi;