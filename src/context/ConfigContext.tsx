import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface Suggestion {
  icon: string;
  title: string;
  prompt: string;
}

export interface ThemeConfig {
  label: string;
  mode: 'light' | 'dark';
  primary: string;
  background: { default: string; paper: string };
  divider?: string;
}

export interface AppConfig {
  appName: string;
  tagline: string;
  systemPrompt: string;
  disclaimer: string;
  suggestions: Suggestion[];
  defaultTheme: string;
  themes: Record<string, ThemeConfig>;
}

const BUILTIN_THEMES: Record<string, ThemeConfig> = {
  dark: {
    label: 'Dark',
    mode: 'dark',
    primary: '#6366f1',
    background: { default: '#0f0f14', paper: '#16161d' },
    divider: 'rgba(255,255,255,0.08)',
  },
  light: {
    label: 'Light',
    mode: 'light',
    primary: '#6366f1',
    background: { default: '#fafafa', paper: '#ffffff' },
  },
};

const DEFAULT_CONFIG: AppConfig = {
  appName: 'ChatBot',
  tagline: 'Your AI-powered assistant.',
  systemPrompt: '',
  disclaimer: '',
  suggestions: [],
  defaultTheme: 'dark',
  themes: BUILTIN_THEMES,
};

const ConfigContext = createContext<AppConfig>(DEFAULT_CONFIG);

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data: Partial<AppConfig>) => {
        const merged: AppConfig = {
          ...DEFAULT_CONFIG,
          ...data,
          themes: { ...BUILTIN_THEMES, ...data.themes },
        };
        setConfig(merged);
        document.title = merged.appName || 'ChatBot';
      })
      .catch(() => {});
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}
