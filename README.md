# Vertex

A modern, configurable AI agent platform built with React, TypeScript, and Material UI. Powered by OpenRouter with streaming responses, designed to evolve into a full agentic system.

## Features

- **Streaming AI Responses** — Real-time token-by-token streaming via Server-Sent Events
- **Markdown Rendering** — Agent responses rendered with full markdown support (code blocks, tables, lists, etc.)
- **Collapsible Sidebar** — Chat history grouped by date, with search, pin, rename, and delete
- **File Upload** — Attach documents (PDF, TXT, CSV, JSON, MD, etc.) with file preview
- **Voice Input** — Microphone button for voice recording
- **Configurable Themes** — Multiple built-in themes (Obsidian, Midnight Ocean, Ember, Forest, Agent Red + Dark/Light defaults), fully customizable via YAML
- **YAML Configuration** — App name, tagline, system prompt, disclaimer, suggestions, and themes — all driven from a single `config.yaml`
- **RAG Pipeline** — ChromaDB-based document ingestion and retrieval (ready for cloud ChromaDB integration)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| UI | Material UI v9 |
| Backend | Express (Node.js) |
| AI | AI SDK + OpenRouter |
| Streaming | Server-Sent Events (SSE) |
| RAG | ChromaDB (ingestion, chunking, querying) |
| Config | YAML (`js-yaml`) |

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Installation

```bash
yarn install
```

### Environment Setup

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_DEFAULT_MODEL=openrouter/free
```

### Development

```bash
yarn dev:all
```

This starts both the Vite dev server and the Express backend concurrently.

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

### Build

```bash
yarn build
```

## Configuration

All app settings live in `config.yaml` at the project root.

### App Settings

```yaml
appName: Vertex
tagline: "Your AI agent — reason, act, and automate."
systemPrompt: "You are {{appName}}, an intelligent AI agent."
disclaimer: "{{appName}} can make mistakes. Consider checking important information."
```

Use `{{appName}}` in any string field to reference the app name dynamically.

### Suggestion Cards

```yaml
suggestions:
  - icon: Code          # MUI icon name
    title: Write code
    prompt: "Help me write a function to sort an array..."
```

Available icons: `Code`, `AutoAwesome`, `EditNote`, `School`, `Lightbulb`, `Psychology`, `Create`, `Build`

### Themes

Define as many custom themes as you want. Built-in Dark and Light are always available.

```yaml
defaultTheme: obsidian

themes:
  obsidian:
    label: Obsidian
    mode: dark               # "dark" or "light" — sets MUI base palette
    primary: "#6366f1"
    background:
      default: "#0f0f14"
      paper: "#16161d"
    divider: "rgba(255,255,255,0.08)"
```

## Project Structure

```
├── config.yaml              # App configuration (name, themes, prompts)
├── server/
│   └── index.ts             # Express API server
├── ai/
│   ├── ai.config.ts         # OpenRouter model factory
│   └── rag/                 # ChromaDB RAG pipeline
│       ├── chunker.ts       # Text chunking
│       ├── ingestion.ts     # Document ingestion
│       ├── query.ts         # Context retrieval
│       └── index.ts         # RAG exports
├── src/
│   ├── App.tsx              # Root component with theme provider
│   ├── context/
│   │   ├── ChatContext.tsx   # Chat state management
│   │   └── ConfigContext.tsx # YAML config provider
│   ├── components/
│   │   ├── Sidebar.tsx       # Collapsible sidebar with chat history
│   │   ├── ChatArea.tsx      # Main chat view
│   │   ├── ChatInput.tsx     # Input bar with file upload & voice
│   │   ├── ChatMessage.tsx   # Message bubbles with markdown
│   │   ├── WelcomeScreen.tsx # Landing screen with suggestion cards
│   │   ├── FilePreview.tsx   # File content preview dialog
│   │   └── TypingIndicator.tsx
│   ├── types/
│   └── utils/
└── .env                     # API keys (not committed)
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server |
| `yarn server` | Start Express backend |
| `yarn dev:all` | Start both concurrently |
| `yarn build` | Production build |
| `yarn lint` | Run ESLint |

## Roadmap

- [ ] Agentic tool-use (function calling, code execution)
- [ ] Cloud ChromaDB RAG integration
- [ ] Multi-agent orchestration
- [ ] Conversation memory & persistence
- [ ] Plugin system

## License

MIT
