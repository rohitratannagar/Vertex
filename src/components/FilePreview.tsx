import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  DataObject as JsonIcon,
  TableChart as CsvIcon,
  TextSnippet as TxtIcon,
} from '@mui/icons-material';
import type { Attachment } from '../types';
import { formatFileSize } from '../utils/helpers';

interface Props {
  attachment: Attachment | null;
  file?: File | null;
  onClose: () => void;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <PdfIcon />;
    case 'json': return <JsonIcon />;
    case 'csv': return <CsvIcon />;
    case 'txt': case 'log': return <TxtIcon />;
    default: return <DocIcon />;
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

export default function FilePreview({ attachment, file, onClose }: Props) {
  const theme = useTheme();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attachment) {
      setContent(null);
      setError(null);
      return;
    }

    if (!file) {
      setContent(null);
      setError('File content not available for preview.');
      return;
    }

    const ext = attachment.name.split('.').pop()?.toLowerCase();
    const textExts = ['txt', 'md', 'json', 'csv', 'log', 'xml', 'yaml', 'yml', 'env', 'ts', 'js', 'py', 'html', 'css'];

    if (!textExts.includes(ext ?? '')) {
      setContent(null);
      setError(`Preview not available for .${ext} files.`);
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string);
      setLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };
    reader.readAsText(file);
  }, [attachment, file]);

  if (!attachment) return null;

  const color = getFileColor(attachment.name);
  const ext = attachment.name.split('.').pop()?.toLowerCase();
  const isJson = ext === 'json';

  let displayContent = content;
  if (isJson && content) {
    try {
      displayContent = JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      // keep raw content
    }
  }

  return (
    <Dialog
      open={!!attachment}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: '80vh',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pr: 6,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: alpha(color, 0.12),
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {getFileIcon(attachment.name)}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {attachment.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(attachment.size)} &middot; {ext?.toUpperCase()}
            {attachment.chunksStored ? ` · ${attachment.chunksStored} chunks indexed` : ''}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {error && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">{error}</Typography>
          </Box>
        )}

        {displayContent && (
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 3,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 100px)',
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.3)'
                : 'rgba(0,0,0,0.03)',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.text.primary, 0.15),
                borderRadius: 3,
              },
            }}
          >
            {displayContent}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
