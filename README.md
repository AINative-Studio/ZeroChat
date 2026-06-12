# ZeroChat

AI-native agent chat interface with streaming responses, multi-agent selection, and code highlighting.

Built with Next.js, TypeScript, and Tailwind CSS using the AI Kit design system.

## Features

- **Multi-Agent Selection** — Switch between Research, Coder, and Analyst agents with color-coded badges
- **Streaming Responses** — Token-by-token typewriter animation with wave indicator
- **Code Blocks** — Syntax-highlighted with hover-to-reveal copy button
- **Markdown Rendering** — Headings, bold, inline code, lists, blockquotes
- **Design System** — AI Kit brand tokens (purple, teal, gold, cyan), Poppins + JetBrains Mono fonts
- **Animations** — Slide-up messages, pulse-glow indicator, gradient-shift hero, glassmorphism

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Fonts**: Poppins, JetBrains Mono (via next/font)

## Project Structure

```
app/
  src/app/
    layout.tsx      # Root layout with fonts and metadata
    globals.css     # Design tokens and animations
    page.tsx        # Full chat interface (single page)
```

## Design Tokens

| Token       | Value                          |
|-------------|--------------------------------|
| Background  | #131726                        |
| Cards       | hsl(228, 29%, 18%)             |
| Purple      | #5867EF                        |
| Teal        | #338585                        |
| Gold        | #FCAE39                        |
| Cyan        | #22BCDE                        |
| Text        | hsl(210, 40%, 98%)             |
| Font Sans   | Poppins                        |
| Font Mono   | JetBrains Mono                 |
