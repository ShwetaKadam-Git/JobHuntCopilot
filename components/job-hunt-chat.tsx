"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, FileText, Link2, Loader2, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: { name: string; type: "cv" | "cover-letter" }[];
  jobUrl?: string;
}

interface AnalysisResult {
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  matchScore?: number;
  suggestions?: string[];
  error?: string;
}

export function JobHuntChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your JobHunt Copilot. Upload your CV and cover letter, then paste the job link - I'll analyze how well your application matches the position.",
    },
  ]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cv" | "cover-letter"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "cv") {
        setCvFile(file);
      } else {
        setCoverLetterFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!cvFile || !coverLetterFile || !jobUrl.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Analyze my application for: ${jobUrl}`,
      files: [
        { name: cvFile.name, type: "cv" },
        { name: coverLetterFile.name, type: "cover-letter" },
      ],
      jobUrl: jobUrl,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("coverLetter", coverLetterFile);
      formData.append("jobUrl", jobUrl);

      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      });

      const data: AnalysisResult = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatAnalysisResult(data),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, there was an error analyzing your application. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCvFile(null);
      setCoverLetterFile(null);
      setJobUrl("");
    }
  };

  const formatAnalysisResult = (data: AnalysisResult): string => {
    if (data.error) {
      return `Error: ${data.error}`;
    }

    let result = "";

    if (data.matchScore !== undefined) {
      result += `**Match Score: ${data.matchScore}%**\n\n`;
    }

    if (data.summary) {
      result += `**Summary**\n${data.summary}\n\n`;
    }

    if (data.strengths && data.strengths.length > 0) {
      result += `**Strengths**\n${data.strengths.map((s) => `- ${s}`).join("\n")}\n\n`;
    }

    if (data.improvements && data.improvements.length > 0) {
      result += `**Areas for Improvement**\n${data.improvements.map((i) => `- ${i}`).join("\n")}\n\n`;
    }

    if (data.suggestions && data.suggestions.length > 0) {
      result += `**Suggestions**\n${data.suggestions.map((s) => `- ${s}`).join("\n")}`;
    }

    return result || JSON.stringify(data, null, 2);
  };

  const canSubmit = cvFile && coverLetterFile && jobUrl.trim() && !isLoading;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">JobHuntCopilot</h1>
          <p className="text-sm text-muted-foreground">AI-powered application analyzer</p>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  message.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <Bot className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "assistant"
                    ? "bg-card text-card-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.files && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {message.files.map((file, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-md bg-background/20 px-2 py-1 text-xs"
                      >
                        <FileText className="h-3 w-3" />
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p key={i} className="mt-2 font-semibold first:mt-0">
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <p key={i} className="ml-2">
                          {line}
                        </p>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-card-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing your application...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border px-4 py-4">
        <div className="mx-auto max-w-3xl">
          {/* File Upload Indicators */}
          <div className="mb-3 flex flex-wrap gap-2">
            {cvFile && (
              <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-card-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span className="max-w-[150px] truncate">{cvFile.name}</span>
                <button
                  onClick={() => setCvFile(null)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </div>
            )}
            {coverLetterFile && (
              <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-card-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span className="max-w-[150px] truncate">{coverLetterFile.name}</span>
                <button
                  onClick={() => setCoverLetterFile(null)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="flex items-end gap-2 rounded-2xl bg-card p-2">
            {/* File Upload Buttons */}
            <div className="flex gap-1">
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileChange(e, "cv")}
                className="hidden"
              />
              <button
                onClick={() => cvInputRef.current?.click()}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition-colors ${
                  cvFile
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                title="Upload CV"
              >
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">CV</span>
              </button>

              <input
                ref={coverLetterInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileChange(e, "cover-letter")}
                className="hidden"
              />
              <button
                onClick={() => coverLetterInputRef.current?.click()}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition-colors ${
                  coverLetterFile
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                title="Upload Cover Letter"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Cover Letter</span>
              </button>
            </div>

            {/* URL Input */}
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-input px-3 py-2">
              <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="url"
                placeholder="Paste job listing URL..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Upload your CV, cover letter, and paste the job URL to get AI-powered analysis
          </p>
        </div>
      </div>
    </div>
  );
}
