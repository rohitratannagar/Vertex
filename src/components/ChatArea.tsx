import { useEffect, useRef } from 'react';
import { Box, IconButton, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { Menu as MenuIcon, AutoAwesome as SparkleIcon } from '@mui/icons-material';
import { useChatContext } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';

export default function ChatArea() {
  const theme = useTheme();
  const { activeChat, isTyping, sidebarOpen, toggleSidebar } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const hasMessages = activeChat && activeChat.messages.length > 0;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'margin-left 0.2s ease',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          bgcolor: alpha(theme.palette.background.default, 0.8),
          minHeight: 56,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!sidebarOpen && (
            <Tooltip title="Open sidebar">
              <IconButton size="small" onClick={toggleSidebar} sx={{ mr: 0.5 }}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          <SparkleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {activeChat ? activeChat.title : 'New Chat'}
          </Typography>
        </Box>

      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha(theme.palette.text.primary, 0.15),
            borderRadius: 3,
          },
        }}
      >
        {hasMessages ? (
          <Box sx={{ flex: 1, py: 2 }}>
            {activeChat.messages.map((msg) => {
              if (msg.role === 'assistant' && !msg.content) return null;
              return <ChatMessage key={msg.id} message={msg} />;
            })}
            {isTyping && activeChat.messages.at(-1)?.content === '' && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </Box>
        ) : (
          <WelcomeScreen />
        )}
      </Box>

      {/* Input */}
      <ChatInput />
    </Box>
  );
}
