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
  status?: "success" | "error";
  message?: string;
  result?: {
    match_score?: string;
    cv_analysis?: {
      missing_keywords?: string[];
      skills_to_add?: string[];
      experience_improvements?: string[];
      ats_tips?: string[];
    };
    cover_letter_analysis?: {
      issues?: string[];
      improvements?: string[];
      rewritten_cover_letter?: string;
    };
    job_alignment?: {
      strengths?: string[];
      gaps?: string[];
      recommendations?: string[];
    };
    general_feedback?: string[];
    error?: string;
    raw?: string;
  };
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
      formData.append("cover_letter", coverLetterFile);
      formData.append("url", jobUrl);

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
    if (data.status === "error" || data.message) {
      return `Error: ${data.message || "Unknown error occurred"}`;
    }

    const result = data.result;
    if (!result) {
      return JSON.stringify(data, null, 2);
    }

    if (result.error) {
      return `Error: ${result.error}\n\n${result.raw || ""}`;
    }

    let output = "";

    if (result.match_score !== undefined) {
      output += `**Match Score: ${result.match_score}%**\n\n`;
    }

    // CV Analysis
    if (result.cv_analysis) {
      output += `**CV Analysis**\n\n`;
      
      if (result.cv_analysis.missing_keywords?.length) {
        output += `*Missing Keywords:*\n${result.cv_analysis.missing_keywords.map((k) => `- ${k}`).join("\n")}\n\n`;
      }
      if (result.cv_analysis.skills_to_add?.length) {
        output += `*Skills to Add:*\n${result.cv_analysis.skills_to_add.map((s) => `- ${s}`).join("\n")}\n\n`;
      }
      if (result.cv_analysis.experience_improvements?.length) {
        output += `*Experience Improvements:*\n${result.cv_analysis.experience_improvements.map((e) => `- ${e}`).join("\n")}\n\n`;
      }
      if (result.cv_analysis.ats_tips?.length) {
        output += `*ATS Tips:*\n${result.cv_analysis.ats_tips.map((t) => `- ${t}`).join("\n")}\n\n`;
      }
    }

    // Cover Letter Analysis
    if (result.cover_letter_analysis) {
      output += `**Cover Letter Analysis**\n\n`;
      
      if (result.cover_letter_analysis.issues?.length) {
        output += `*Issues:*\n${result.cover_letter_analysis.issues.map((i) => `- ${i}`).join("\n")}\n\n`;
      }
      if (result.cover_letter_analysis.improvements?.length) {
        output += `*Improvements:*\n${result.cover_letter_analysis.improvements.map((i) => `- ${i}`).join("\n")}\n\n`;
      }
      if (result.cover_letter_analysis.rewritten_cover_letter) {
        output += `*Suggested Rewrite:*\n${result.cover_letter_analysis.rewritten_cover_letter}\n\n`;
      }
    }

    // Job Alignment
    if (result.job_alignment) {
      output += `**Job Alignment**\n\n`;
      
      if (result.job_alignment.strengths?.length) {
        output += `*Strengths:*\n${result.job_alignment.strengths.map((s) => `- ${s}`).join("\n")}\n\n`;
      }
      if (result.job_alignment.gaps?.length) {
        output += `*Gaps:*\n${result.job_alignment.gaps.map((g) => `- ${g}`).join("\n")}\n\n`;
      }
      if (result.job_alignment.recommendations?.length) {
        output += `*Recommendations:*\n${result.job_alignment.recommendations.map((r) => `- ${r}`).join("\n")}\n\n`;
      }
    }

    // General Feedback
    if (result.general_feedback?.length) {
      output += `**General Feedback**\n${result.general_feedback.map((f) => `- ${f}`).join("\n")}`;
    }

    return output || JSON.stringify(data, null, 2);
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
