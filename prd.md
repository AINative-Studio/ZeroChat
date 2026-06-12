# The Build: "ZeroChat" — A Multi-Agent AI Chat Interface

Why this project works for a demo:
- Uses real AI Kit components (StreamingMessage, StreamingIndicator, CodeBlock)
- Hits the design system hard (brand purples, Poppins/JetBrains Mono, animations)
- Looks impressive fast (dark mode, gradient-shift, pulse-glow)
- Shows 3+ component patterns in one screen

---

## The PRD Students Will Write (Then Feed to AI)

Here's the template you'd walk through with the class:

# PRD: ZeroChat — AI Agent Chat Interface

## What We're Building
A single-page AI chat app with streaming responses, agent selection, and code highlighting. Dark mode, polished, production-grade feel.

## Design System

### Colors (AI Kit brand tokens)
- Background: #131726 (dark navy)
- Cards: hsl(228, 29%, 18%)
- Primary: #5867EF (brand purple)
- Secondary: #338585 (brand teal)
- Accent: #FCAE39 (brand gold) — used for active states
- Cyan: #22BCDE — used for agent badges
- Text: hsl(210, 40%, 98%)
- Muted text: hsl(223, 30%, 27%)

### Typography
- Headings & UI: Poppins (500, 600, 700)
- Code & mono: JetBrains Mono (400, 500)
- Base size: 14px body, 12px metadata

### Animations
- Message appear: slide-up 0.5s ease-out
- Streaming indicator: pulse-glow 2s infinite
- Background hero: gradient-shift 8s infinite
- Code block copy button: fade-in 0.3s

### Shadows
- Cards: 0 4px 20px rgba(88, 103, 239, 0.08)
- Input focus: 0 0 0 2px rgba(88, 103, 239, 0.3)

## Layout (Single Page)
1. **Header bar** — App name "ZeroChat", agent selector dropdown (3 agents: Research, Coder, Analyst), dark/light toggle
2. **Chat area** — Scrollable message list, user messages right-aligned (teal bg), AI messages left-aligned (card bg), code blocks with syntax highlighting and copy button
3. **Input area** — Textarea with send button, character count, keyboard shortcut hint (⌘+Enter)
4. **Streaming indicator** — Wave animation while AI responds

## Components to Use
- StreamingMessage from @ainative/aikit-react
- StreamingIndicator (wave variant)
- CodeBlock with "nord" theme
- Custom AgentBadge with cyan/gold/teal per agent type

## Interactions
- Send message → show streaming indicator → stream response token-by-token (typewriter animation)
- Click agent selector → switch agent, show badge color change
- Code blocks → hover reveals copy button → click copies → show "Copied!" toast
- Empty state → show 3 example prompt cards with gradient borders

## Sample Data
Pre-load 2 messages:
1. User: "Write a Python function to calculate fibonacci"
2. AI: Streams a response with a code block and explanation

---

## Teaching Points to Hit

### During PRD writing (5-12 min):
- "The PRD IS the product. Garbage spec = garbage UI."
- Show how design tokens eliminate ambiguity — no "make it look nice"
- Point out the specificity: exact hex codes, animation durations, component names
- "You're not coding, you're art-directing an AI engineer"

### During vibe coding (12-25 min):
- Paste the PRD into Claude Code with: "Build this as a single Next.js page using the AI Kit design system. Use Tailwind CSS. Make it beautiful."
- Let students see it generate in real-time
- Point out how specific PRD specs → specific code decisions
- If something's off, show the "tweak loop": "Make the gradient more subtle", "Add a glassmorphism effect to the cards"

### During polish (25-30 min):
- Add one "delight" feature live: particle background, typing sound effect, or message reactions
- Recap: PRD specificity → design quality. The AI is only as good as your spec.
