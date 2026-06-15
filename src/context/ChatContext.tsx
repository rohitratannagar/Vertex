import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Chat, Message, ThemeMode, Attachment } from '../types';
import { useConfig } from './ConfigContext';
import { generateId } from '../utils/helpers';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  isTyping: boolean;
  createChat: () => void;
  deleteChat: (id: string) => void;
  selectChat: (id: string) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  pinChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  setThemeMode: (id: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const config = useConfig();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(config.defaultTheme || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const chatsRef = useRef(chats);
  chatsRef.current = chats;

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const createChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) setActiveChatId(null);
    },
    [activeChatId],
  );

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const sendMessage = useCallback(
    (content: string, attachments?: Attachment[]) => {
      let chatId = activeChatId;

      if (!chatId) {
        const newChat: Chat = {
          id: generateId(),
          title: content.slice(0, 40) || 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        chatId = newChat.id;
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(chatId);
      }

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
        attachments: attachments?.map(({ file: _f, ...rest }) => rest),
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const isNew = c.messages.length === 0;
          return {
            ...c,
            title: isNew ? content.slice(0, 40) || 'New Chat' : c.title,
            messages: [...c.messages, userMsg],
            updatedAt: new Date(),
          };
        }),
      );

      const botMsgId = generateId();
      const botMsg: Message = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, botMsg], updatedAt: new Date() }
            : c,
        ),
      );

      setIsTyping(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const finalChatId = chatId;

      (async () => {
        try {
          const currentChat = chatsRef.current.find((c) => c.id === finalChatId);
          const allMessages = (currentChat?.messages ?? [])
            .filter((m) => m.content)
            .map((m) => ({ role: m.role, content: m.content }));
          if (!allMessages.some((m) => m.role === 'user' && m.content === content)) {
            allMessages.push({ role: 'user' as const, content });
          }

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: allMessages }),
            signal: controller.signal,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || `HTTP ${res.status}`);
          }

          const reader = res.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error('No response stream');

          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const { text } = JSON.parse(data);
                if (text) {
                  setChats((prev) =>
                    prev.map((c) =>
                      c.id === finalChatId
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === botMsgId ? { ...m, content: m.content + text } : m,
                            ),
                            updatedAt: new Date(),
                          }
                        : c,
                    ),
                  );
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
          setChats((prev) =>
            prev.map((c) =>
              c.id === finalChatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === botMsgId
                        ? { ...m, content: m.content || `Error: ${(err as Error).message}` }
                        : m,
                    ),
                  }
                : c,
            ),
          );
        } finally {
          setIsTyping(false);
        }
      })();
    },
    [activeChatId],
  );

  const pinChat = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }, []);

  const renameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  }, []);

  const setThemeMode = useCallback((id: string) => {
    setThemeModeState(id);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        themeMode,
        sidebarOpen,
        isTyping,
        createChat,
        deleteChat,
        selectChat,
        sendMessage,
        pinChat,
        renameChat,
        setThemeMode,
        toggleSidebar,
        setSidebarOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
