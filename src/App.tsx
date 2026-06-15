import { useMemo } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ChatProvider, useChatContext } from './context/ChatContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function AppShell() {
  const { themeMode } = useChatContext();
  const config = useConfig();

  const theme = useMemo(() => {
    const themeConfig = config.themes[themeMode];
    const mode = themeConfig?.mode ?? 'dark';
    const primary = themeConfig?.primary ?? '#6366f1';
    const bg = themeConfig?.background ?? (mode === 'dark'
      ? { default: '#0f0f14', paper: '#16161d' }
      : { default: '#fafafa', paper: '#ffffff' });
    const divider = themeConfig?.divider;

    return createTheme({
      palette: {
        mode,
        primary: {
          main: primary,
        },
        background: bg,
        ...(divider ? { divider } : {}),
      },
      typography: {
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      shape: { borderRadius: 12 },
      components: {
        MuiButton: {
          styleOverrides: {
            root: { textTransform: 'none', fontWeight: 600 },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: { borderRadius: 10 },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: { backgroundImage: 'none' },
          },
        },
      },
    });
  }, [themeMode, config.themes]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <ChatArea />
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <ChatProvider>
        <AppShell />
      </ChatProvider>
    </ConfigProvider>
  );
}
