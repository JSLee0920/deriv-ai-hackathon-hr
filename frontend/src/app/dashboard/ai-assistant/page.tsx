"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, MessageSquare, Send, Sparkles, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const faqs = [
  "What is our annual leave policy?",
  "What are the expenses reimbursement limits?",
  "What benefits do we offer to full-time employees?",
];

export default function AIAssistantPage() {
  const [id, setId] = useState<number>(2);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I am the AetherHR AI Assistant. I can help you with policy questions and HR processes. What would you like to know?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const newMessage: Message = {
      id: id + 1,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setId((prev) => prev + 1);
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });

    const data = await response.json();
    console.log("AI Assistant response data:", data);

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: id + 2,
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setId((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="mt-2 text-muted-foreground">
          Ask questions about company policies, HR processes, and get instant
          answers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Section */}
        <Card
          className="flex flex-col border-border bg-card lg:col-span-3"
          style={{ height: "calc(100vh - 220px)" }}
        >
          <CardHeader className="shrink-0 border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" />
              HR Chat
              <Badge
                variant="outline"
                className="ml-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs"
              >
                Online
              </Badge>
            </CardTitle>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
            <div className="flex flex-col gap-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === "assistant"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === "assistant"
                        ? "bg-secondary text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <article className="whitespace-pre-line text-sm leading-relaxed">
                      <Markdown>{msg.content}</Markdown>
                    </article>
                    <p
                      className={`mt-1 text-xs ${msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg bg-secondary px-4 py-3">
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="shrink-0 border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about policies, leave, equity, expenses..."
                className="flex-1 border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send Message</span>
              </Button>
            </form>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggested Questions
          </h3>
          {faqs.map((faq, index) => (
            <button
              key={index}
              onClick={() => handleSend(faq)}
              className="rounded-lg border border-border bg-card p-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-foreground"
            >
              {faq}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
