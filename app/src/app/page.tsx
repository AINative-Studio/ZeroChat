"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
type AgentType = "research" | "coder" | "analyst";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: AgentType;
  timestamp: Date;
}

// ─── Agent Config ───────────────────────────────────────────────────────────
const AGENTS: Record<AgentType, { label: string; color: string; icon: string }> = {
  research: { label: "Research", color: "bg-brand-cyan", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  coder: { label: "Coder", color: "bg-brand-gold", icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
  analyst: { label: "Analyst", color: "bg-brand-teal", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
};

const EXAMPLE_PROMPTS = [
  { title: "Write a function", prompt: "Write a Python function to calculate fibonacci numbers" },
  { title: "Explain a concept", prompt: "Explain how transformer attention mechanisms work" },
  { title: "Analyze data", prompt: "What are the key metrics I should track for a SaaS startup?" },
];

// ─── Simulated streaming response ───────────────────────────────────────────
const SAMPLE_RESPONSES: Record<AgentType, string> = {
  coder: `Here's an efficient Fibonacci implementation using memoization:

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Usage
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

This uses Python's built-in \`lru_cache\` decorator to memoize results, giving us **O(n)** time complexity instead of the naive **O(2^n)** recursive approach.

For very large values, you can also use an iterative approach:

\`\`\`python
def fibonacci_iter(n: int) -> int:
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
\`\`\`

The iterative version uses **O(1)** space and avoids Python's recursion limit.`,

  research: `Great question! Here's what I found:

**Transformer Attention Mechanisms** are the core innovation behind models like GPT, Claude, and BERT.

The key idea is **self-attention** — allowing each token in a sequence to attend to every other token, weighted by relevance.

### How it works:

1. Each token is projected into three vectors: **Query (Q)**, **Key (K)**, and **Value (V)**
2. Attention scores are computed as: \`softmax(QK^T / sqrt(d_k)) * V\`
3. Multi-head attention runs this in parallel across multiple "heads"

\`\`\`python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / d_k**0.5
    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, V)
\`\`\`

This mechanism allows the model to capture **long-range dependencies** without the sequential bottleneck of RNNs.`,

  analyst: `Here are the **key SaaS metrics** every startup should track:

### Revenue Metrics
- **MRR** (Monthly Recurring Revenue) — your baseline growth signal
- **ARR** (Annual Recurring Revenue) — MRR × 12, used for fundraising
- **ARPU** (Average Revenue Per User) — signals pricing power

### Growth Metrics
- **Month-over-month growth** — target 15-20% for early stage
- **Net Revenue Retention (NRR)** — >100% means expansion > churn
- **CAC Payback Period** — ideally < 12 months

### Engagement Metrics
- **DAU/MAU ratio** — measures stickiness (>40% is strong)
- **Feature adoption rate** — which features drive retention
- **Time to value** — how fast users reach their "aha moment"

\`\`\`python
# Quick NRR calculation
def net_revenue_retention(start_mrr, expansion, contraction, churn):
    return (start_mrr + expansion - contraction - churn) / start_mrr * 100
\`\`\`

> **Rule of thumb**: If NRR > 120%, your existing customers alone will grow your revenue — even with zero new sales.`,
};

// ─── Components ─────────────────────────────────────────────────────────────

function AgentBadge({ agent }: { agent: AgentType }) {
  const cfg = AGENTS[agent];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${cfg.color} text-bg-primary`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
      </svg>
      {cfg.label}
    </span>
  );
}

function WaveIndicator() {
  return (
    <div className="flex items-center gap-2 py-4 px-1 animate-slide-up">
      <div className="flex items-end gap-[3px] h-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-brand-purple animate-wave-bar"
            style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-text-muted animate-pulse-glow">Thinking...</span>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 rounded-lg overflow-hidden border border-white/[0.06]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1017] text-[11px] text-text-muted font-mono uppercase tracking-wider">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover:text-text-primary hover:bg-white/[0.06]"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto bg-[#0d1017] text-[13px] leading-relaxed font-mono text-[#c9d1d9]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Parse markdown-like content into segments
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-[14px] leading-relaxed">
      {segments.map((segment, i) => {
        const codeMatch = segment.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (codeMatch) {
          return <CodeBlock key={i} language={codeMatch[1] || "text"} code={codeMatch[2].trim()} />;
        }
        // Render inline formatting
        return (
          <div key={i} className="whitespace-pre-wrap">
            {segment.split("\n").map((line, j) => {
              // Headings
              if (line.startsWith("### ")) return <h3 key={j} className="text-[15px] font-semibold mt-4 mb-1 text-text-primary">{line.slice(4)}</h3>;
              if (line.startsWith("## ")) return <h2 key={j} className="text-base font-semibold mt-4 mb-1 text-text-primary">{line.slice(3)}</h2>;
              // Blockquote
              if (line.startsWith("> ")) return <blockquote key={j} className="border-l-2 border-brand-purple pl-3 my-2 text-text-muted italic">{formatInline(line.slice(2))}</blockquote>;
              // List items
              if (line.startsWith("- ")) return <div key={j} className="flex gap-2 my-0.5"><span className="text-brand-purple mt-0.5">*</span><span>{formatInline(line.slice(2))}</span></div>;
              // Numbered list
              const numMatch = line.match(/^(\d+)\.\s/);
              if (numMatch) return <div key={j} className="flex gap-2 my-0.5"><span className="text-brand-purple font-mono text-[12px] mt-0.5 w-4 text-right">{numMatch[1]}.</span><span>{formatInline(line.slice(numMatch[0].length))}</span></div>;
              // Empty line
              if (line.trim() === "") return <div key={j} className="h-2" />;
              // Normal text
              return <span key={j}>{formatInline(line)}{"\n"}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Bold, inline code, then return
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-text-primary">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith("`")) {
      parts.push(<code key={match.index} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-brand-cyan text-[13px] font-mono">{m.slice(1, -1)}</code>);
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [agent, setAgent] = useState<AgentType>("coder");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedContent, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const simulateStream = useCallback((text: string, agentType: AgentType) => {
    setIsStreaming(true);
    setStreamedContent("");
    let i = 0;
    const speed = 8; // ms per character

    const interval = setInterval(() => {
      // Stream in chunks of 1-3 chars for natural feel
      const chunkSize = Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1;
      const chunk = text.slice(i, i + chunkSize);
      i += chunkSize;

      setStreamedContent((prev) => prev + chunk);

      if (i >= text.length) {
        clearInterval(interval);
        setIsStreaming(false);
        setStreamedContent("");
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: text,
            agent: agentType,
            timestamp: new Date(),
          },
        ]);
      }
    }, speed);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Pick response based on agent
    setTimeout(() => {
      simulateStream(SAMPLE_RESPONSES[agent], agent);
    }, 600);
  }, [agent, isStreaming, simulateStream]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">ZeroChat</h1>
        </div>

        {/* Agent Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAgentMenu(!showAgentMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-brand-purple/40 transition-colors text-sm"
          >
            <AgentBadge agent={agent} />
            <svg className={`w-4 h-4 text-text-muted transition-transform ${showAgentMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showAgentMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-bg-card border border-white/[0.08] shadow-[0_4px_20px_rgba(88,103,239,0.12)] overflow-hidden z-50 animate-fade-in">
              {(Object.entries(AGENTS) as [AgentType, typeof AGENTS.research][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setAgent(key); setShowAgentMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-white/[0.04] transition-colors ${agent === key ? "bg-white/[0.06]" : ""}`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                  <span>{cfg.label} Agent</span>
                  {agent === key && (
                    <svg className="w-4 h-4 ml-auto text-brand-purple" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ─── Chat Area ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {isEmpty ? (
            /* ─── Empty State ──────────────────────────────────── */
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              {/* Hero */}
              <div className="relative mb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-cyan to-brand-teal flex items-center justify-center animate-gradient-shift">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <div className="absolute -inset-4 rounded-3xl bg-brand-purple/10 blur-2xl -z-10" />
              </div>

              <h2 className="text-2xl font-semibold mb-2 tracking-tight">What can I help you build?</h2>
              <p className="text-text-muted text-sm mb-8">Choose an agent and start a conversation</p>

              {/* Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.prompt)}
                    className="group relative p-4 rounded-xl bg-bg-card border border-white/[0.06] hover:border-brand-purple/30 transition-all duration-300 text-left shadow-[0_4px_20px_rgba(88,103,239,0.08)] hover:shadow-[0_4px_24px_rgba(88,103,239,0.15)]"
                  >
                    {/* Gradient border on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-purple/20 via-transparent to-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    <h3 className="text-sm font-medium mb-1">{p.title}</h3>
                    <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2">{p.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ─── Messages ─────────────────────────────────────── */
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-brand-teal/90 text-white text-[14px] leading-relaxed shadow-lg">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[85%] space-y-2">
                      <AgentBadge agent={msg.agent!} />
                      <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-bg-card border border-white/[0.06] shadow-[0_4px_20px_rgba(88,103,239,0.08)]">
                        <MessageContent content={msg.content} />
                      </div>
                      <div className="text-[11px] text-text-dim pl-1 font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming message */}
              {isStreaming && streamedContent && (
                <div className="flex justify-start animate-slide-up">
                  <div className="max-w-[85%] space-y-2">
                    <AgentBadge agent={agent} />
                    <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-bg-card border border-white/[0.06] shadow-[0_4px_20px_rgba(88,103,239,0.08)]">
                      <MessageContent content={streamedContent} />
                      <span className="inline-block w-[2px] h-[18px] bg-brand-purple ml-0.5 align-middle" style={{ animation: "typewriter-cursor 0.8s step-end infinite" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Wave indicator before content starts */}
              {isStreaming && !streamedContent && <WaveIndicator />}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ─── Input Area ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-bg-card/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-3 rounded-xl bg-bg-input border border-white/[0.08] focus-within:border-brand-purple/50 focus-within:shadow-[0_0_0_2px_rgba(88,103,239,0.3)] transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${AGENTS[agent].label} Agent...`}
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent px-4 py-3 text-[14px] text-text-primary placeholder:text-text-dim resize-none outline-none disabled:opacity-50 max-h-40"
            />
            <div className="flex items-center gap-2 pr-3 pb-3">
              <span className="text-[11px] text-text-dim font-mono tabular-nums">
                {input.length > 0 ? input.length : ""}
              </span>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-30 disabled:hover:bg-brand-purple transition-all"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[11px] text-text-dim">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono">&#8984;+Enter</kbd>
              <span className="ml-1.5">to send</span>
            </p>
            <p className="text-[11px] text-text-dim">
              Powered by <span className="text-brand-purple font-medium">AIKit</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Click outside to close agent menu */}
      {showAgentMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAgentMenu(false)} />
      )}
    </div>
  );
}
