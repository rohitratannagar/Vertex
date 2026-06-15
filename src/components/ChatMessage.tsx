import { Box, Typography, Avatar, Paper, Chip, alpha, useTheme } from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as PersonIcon,
  InsertDriveFile as FileIcon,
  ContentCopy as CopyIcon,
  ThumbUpOffAlt as ThumbUpIcon,
  ThumbDownOffAlt as ThumbDownIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';
import { useConfig } from '../context/ConfigContext';
import { formatTime, formatFileSize } from '../utils/helpers';

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const theme = useTheme();
  const config = useConfig();
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        maxWidth: 800,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        py: 1.5,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          mt: 0.5,
          bgcolor: isUser
            ? alpha(theme.palette.primary.main, 0.15)
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          background: isUser ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: isUser ? 'primary.main' : '#fff',
          fontSize: 16,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0, maxWidth: '85%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 12 }}>
            {isUser ? 'You' : config.appName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.5, fontSize: 11 }}>
            {formatTime(message.timestamp)}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            bgcolor: isUser
              ? 'primary.main'
              : alpha(theme.palette.text.primary, 0.06),
            color: isUser ? 'primary.contrastText' : 'text.primary',
          }}
        >
          {isUser ? (
            <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          ) : (
            <Box
              sx={{
                fontSize: 14,
                lineHeight: 1.75,
                '& p': { m: 0, mb: 1.5, '&:last-child': { mb: 0 } },
                '& h1, & h2, & h3, & h4': { mt: 2, mb: 1, fontWeight: 700 },
                '& h1': { fontSize: '1.3em' },
                '& h2': { fontSize: '1.15em' },
                '& h3': { fontSize: '1.05em' },
                '& ul, & ol': { pl: 2.5, mb: 1.5 },
                '& li': { mb: 0.5 },
                '& strong': { fontWeight: 600 },
                '& a': { color: 'primary.light', textDecoration: 'underline' },
                '& blockquote': {
                  borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                  pl: 2,
                  ml: 0,
                  my: 1.5,
                  opacity: 0.85,
                },
                '& code': {
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '0.85em',
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 0.8,
                },
                '& pre': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(0,0,0,0.4)'
                    : 'rgba(0,0,0,0.06)',
                  borderRadius: 2,
                  p: 2,
                  my: 1.5,
                  overflowX: 'auto',
                  '& code': {
                    bgcolor: 'transparent',
                    px: 0,
                    py: 0,
                    fontSize: '0.85em',
                  },
                },
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                  my: 1.5,
                  fontSize: 13,
                },
                '& th, & td': {
                  border: `1px solid ${theme.palette.divider}`,
                  px: 1.5,
                  py: 0.75,
                  textAlign: 'left',
                },
                '& th': {
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                },
                '& hr': {
                  border: 'none',
                  borderTop: `1px solid ${theme.palette.divider}`,
                  my: 2,
                },
              }}
            >
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
            </Box>
          )}

          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {message.attachments.map((att) => (
                <Chip
                  key={att.id}
                  icon={<FileIcon fontSize="small" />}
                  label={`${att.name} (${formatFileSize(att.size)})${att.chunksStored ? ` · ${att.chunksStored} chunks` : ''}${att.status === 'error' ? ' · failed' : ''}`}
                  size="small"
                  variant="outlined"
                  color={att.status === 'error' ? 'error' : att.chunksStored ? 'success' : 'default'}
                  sx={{
                    borderColor: isUser
                      ? alpha('#fff', 0.3)
                      : undefined,
                    color: isUser ? '#fff' : undefined,
                    '& .MuiChip-icon': {
                      color: isUser ? alpha('#fff', 0.7) : undefined,
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>

        {!isUser && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, ml: 0.5 }}>
            <Tooltip title="Copy">
              <IconButton
                size="small"
                sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <CopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Good response">
              <IconButton size="small" sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                <ThumbUpIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bad response">
              <IconButton size="small" sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                <ThumbDownIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}
