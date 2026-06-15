import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  alpha,
  useTheme,
  InputBase,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  DataObject as JsonIcon,
  TableChart as CsvIcon,
  TextSnippet as TxtIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { useChatContext } from '../context/ChatContext';
import { useConfig } from '../context/ConfigContext';
import { generateId, formatFileSize } from '../utils/helpers';
import FilePreview from './FilePreview';
import type { Attachment } from '../types';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt,.csv,.json,.md,.xml,.yaml,.yml,.log';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <PdfIcon fontSize="small" />;
    case 'json': return <JsonIcon fontSize="small" />;
    case 'csv': return <CsvIcon fontSize="small" />;
    case 'txt': case 'log': return <TxtIcon fontSize="small" />;
    default: return <DocIcon fontSize="small" />;
  }
}

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '#ef4444';
    case 'json': return '#f59e0b';
    case 'csv': return '#22c55e';
    case 'doc': case 'docx': return '#3b82f6';
    case 'md': return '#8b5cf6';
    default: return '#6b7280';
  }
}

export default function ChatInput() {
  const theme = useTheme();
  const config = useConfig();
  const { sendMessage, isTyping } = useChatContext();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [previewAtt, setPreviewAtt] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    sendMessage(trimmed, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    textareaRef.current?.focus();
  }, [text, attachments, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const valid: Attachment[] = [];
    let blocked = 0;

    for (const f of Array.from(files)) {
      if (IMAGE_TYPES.includes(f.type) || f.type.startsWith('image/')) {
        blocked++;
        continue;
      }
      valid.push({
        id: generateId(),
        name: f.name,
        type: f.type,
        size: f.size,
        file: f,
        status: 'pending',
      });
    }

    if (blocked > 0) {
      setSnackbar(`${blocked} image file${blocked > 1 ? 's' : ''} blocked — only documents are supported.`);
    }

    if (valid.length > 0) {
      setAttachments((prev) => [...prev, ...valid]);
    }

    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 3 }, pb: 2, pt: 1, width: '100%' }}>
      {/* File previews */}
      {attachments.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
          {attachments.map((att) => {
            const color = getFileColor(att.name);
            return (
              <Paper
                key={att.id}
                elevation={0}
                onClick={() => setPreviewAtt(att)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.text.primary, 0.03),
                  minWidth: 180,
                  maxWidth: 260,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: alpha(color, 0.5),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(color, 0.12),
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getFileIcon(att.name)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, fontSize: 12, display: 'block' }}
                    noWrap
                  >
                    {att.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5, fontSize: 11 }}>
                    {formatFileSize(att.size)} &middot; {att.name.split('.').pop()?.toUpperCase()}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeAttachment(att.id)}
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: 'error.main', color: '#fff', borderColor: 'error.main' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Input area */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0.5,
          p: 1,
          pl: 2,
          borderRadius: 4,
          border: `1.5px solid ${alpha(theme.palette.text.primary, 0.12)}`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          onChange={handleFileChange}
          accept={ACCEPTED_TYPES}
        />

        <Tooltip title="Attach document">
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
          >
            <AttachIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <InputBase
          inputRef={textareaRef}
          fullWidth
          multiline
          maxRows={6}
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            flex: 1,
            fontSize: 14,
            lineHeight: 1.6,
            py: 0.5,
            '& textarea': {
              '&::placeholder': { opacity: 0.5 },
            },
          }}
        />

        <Tooltip title="Emoji">
          <IconButton
            size="small"
            sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
          >
            <EmojiIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={isRecording ? 'Stop recording' : 'Voice input'}>
          <IconButton
            size="small"
            onClick={toggleRecording}
            sx={{
              color: isRecording ? 'error.main' : undefined,
              opacity: isRecording ? 1 : 0.5,
              '&:hover': { opacity: 1 },
              animation: isRecording ? 'pulse 1.5s infinite' : undefined,
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
                '70%': { boxShadow: '0 0 0 8px rgba(239,68,68,0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
              },
            }}
          >
            {isRecording ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Send message">
          <span>
            <IconButton
              size="small"
              onClick={handleSend}
              disabled={(!text.trim() && attachments.length === 0) || isTyping}
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                width: 34,
                height: 34,
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': {
                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                  color: alpha('#fff', 0.5),
                },
              }}
            >
              <SendIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 1,
          opacity: 0.4,
          fontSize: 11,
        }}
      >
        {config.disclaimer}
      </Typography>

      <FilePreview
        attachment={previewAtt}
        file={previewAtt?.file ?? null}
        onClose={() => setPreviewAtt(null)}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}
