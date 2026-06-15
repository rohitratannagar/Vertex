import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ChatBubbleOutlined as ChatIcon,
  DeleteOutlined as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  Palette as PaletteIcon,
  Check as ThemeCheckIcon,
  Settings as SettingsIcon,
  PushPin as PinIcon,
  PushPinOutlined as PinOutlinedIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useChatContext } from '../context/ChatContext';
import { useConfig } from '../context/ConfigContext';
import { formatDate, truncate } from '../utils/helpers';

const DEFAULT_WIDTH = 300;
const MIN_WIDTH = 220;
const MAX_WIDTH = 480;

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    chats,
    activeChat,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    createChat,
    selectChat,
    deleteChat,
    pinChat,
    renameChat,
    setThemeMode,
    themeMode,
  } = useChatContext();

  const config = useConfig();
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [drawerWidth, setDrawerWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  const grouped = {
    today: unpinned.filter((c) => {
      const d = new Date(c.updatedAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }),
    yesterday: unpinned.filter((c) => {
      const d = new Date(c.updatedAt);
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return d.toDateString() === y.toDateString();
    }),
    older: unpinned.filter((c) => {
      const d = new Date(c.updatedAt);
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return d < new Date(y.toDateString());
    }),
  };

  const handleSelect = (id: string) => {
    if (editingId) return;
    selectChat(id);
    if (isMobile) setSidebarOpen(false);
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const confirmRename = () => {
    if (editingId && editTitle.trim()) {
      renameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, chatId: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuChatId(chatId);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuChatId(null);
  };

  const menuChat = chats.find((c) => c.id === menuChatId);

  const renderChatItem = (chat: typeof chats[0]) => (
    <ListItemButton
      key={chat.id}
      selected={activeChat?.id === chat.id}
      onClick={() => handleSelect(chat.id)}
      onDoubleClick={() => startRename(chat.id, chat.title)}
      onMouseEnter={() => setHoveredId(chat.id)}
      onMouseLeave={() => setHoveredId(null)}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        py: 1,
        px: 1.5,
        '&.Mui-selected': {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.18),
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {chat.pinned ? (
          <PinIcon fontSize="small" sx={{ opacity: 0.6, fontSize: 16, transform: 'rotate(45deg)' }} />
        ) : (
          <ChatIcon fontSize="small" sx={{ opacity: 0.6 }} />
        )}
      </ListItemIcon>

      {editingId === chat.id ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TextField
            inputRef={editRef}
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmRename();
              if (e.key === 'Escape') cancelRename();
            }}
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              input: { sx: { fontSize: 13, py: 0.25, px: 1 } },
            }}
            sx={{ flex: 1 }}
          />
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); confirmRename(); }}>
            <CheckIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); cancelRename(); }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ) : (
        <ListItemText
          primary={truncate(chat.title, 28)}
          secondary={formatDate(chat.updatedAt)}
          slotProps={{
            primary: {
              sx: {
                fontSize: 13,
                fontWeight: activeChat?.id === chat.id ? 600 : 400,
              },
              noWrap: true,
            },
            secondary: { sx: { fontSize: 11 } },
          }}
        />
      )}

      {(hoveredId === chat.id || menuChatId === chat.id) && editingId !== chat.id && (
        <ListItemSecondaryAction>
          <IconButton
            size="small"
            onClick={(e) => openMenu(e, chat.id)}
            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItemButton>
  );

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {config.appName.charAt(0).toUpperCase()}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>
            {config.appName}
          </Typography>
        </Box>
        <Tooltip title="Collapse sidebar">
          <IconButton size="small" onClick={toggleSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* New Chat */}
      <Box sx={{ px: 2, pb: 1 }}>
        <ListItemButton
          onClick={createChat}
          sx={{
            borderRadius: 2,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
            justifyContent: 'center',
            gap: 1,
            py: 1,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <AddIcon fontSize="small" color="primary" />
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            New Chat
          </Typography>
        </ListItemButton>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search chats…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ opacity: 0.5 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, fontSize: 14 },
            },
          }}
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {/* Pinned */}
        {pinned.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: 0.5,
                opacity: 0.5,
                fontSize: 11,
              }}
            >
              <PinIcon sx={{ fontSize: 11, transform: 'rotate(45deg)' }} />
              Pinned
            </Typography>
            <List disablePadding>
              {pinned.map(renderChatItem)}
            </List>
          </Box>
        )}

        {/* Grouped by date */}
        {Object.entries(grouped).map(
          ([label, items]) =>
            items.length > 0 && (
              <Box key={label}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 1,
                    display: 'block',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    opacity: 0.5,
                    fontSize: 11,
                  }}
                >
                  {label === 'today' ? 'Today' : label === 'yesterday' ? 'Yesterday' : 'Previous'}
                </Typography>
                <List disablePadding>
                  {items.map(renderChatItem)}
                </List>
              </Box>
            ),
        )}

        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
            <Typography variant="body2">No chats found</Typography>
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            if (menuChatId) {
              const chat = chats.find((c) => c.id === menuChatId);
              if (chat) startRename(menuChatId, chat.title);
            }
            closeMenu();
          }}
          sx={{ fontSize: 13, gap: 1.5 }}
        >
          <EditIcon sx={{ fontSize: 16, opacity: 0.7 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuChatId) pinChat(menuChatId);
            closeMenu();
          }}
          sx={{ fontSize: 13, gap: 1.5 }}
        >
          {menuChat?.pinned ? (
            <>
              <PinOutlinedIcon sx={{ fontSize: 16, opacity: 0.7, transform: 'rotate(45deg)' }} />
              Unpin
            </>
          ) : (
            <>
              <PinIcon sx={{ fontSize: 16, opacity: 0.7, transform: 'rotate(45deg)' }} />
              Pin
            </>
          )}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            if (menuChatId) deleteChat(menuChatId);
            closeMenu();
          }}
          sx={{ fontSize: 13, gap: 1.5, color: 'error.main' }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
          Delete
        </MenuItem>
      </Menu>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Theme">
          <IconButton size="small" onClick={(e) => setThemeAnchor(e.currentTarget)}>
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton size="small">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={themeAnchor}
        open={Boolean(themeAnchor)}
        onClose={() => setThemeAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              minWidth: 180,
              maxHeight: 320,
              overflowY: 'auto',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              '&::-webkit-scrollbar': { width: 5 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(128,128,128,0.3)',
                borderRadius: 3,
                '&:hover': { bgcolor: 'rgba(128,128,128,0.5)' },
              },
            },
          },
        }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {Object.entries(config.themes).map(([id, t]) => (
          <MenuItem
            key={id}
            selected={themeMode === id}
            onClick={() => {
              setThemeMode(id);
              setThemeAnchor(null);
            }}
            sx={{ fontSize: 13, gap: 1.5, justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: t.primary,
                  border: `2px solid ${alpha(t.primary, 0.3)}`,
                  flexShrink: 0,
                }}
              />
              {t.label}
            </Box>
            {themeMode === id && (
              <ThemeCheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      sx={{
        width: sidebarOpen ? drawerWidth : 0,
        flexShrink: 0,
        transition: isDragging ? 'none' : 'width 0.2s ease',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          overflow: 'visible',
          transition: isDragging ? 'none' : 'width 0.2s ease',
        },
      }}
    >
      {drawerContent}
      {!isMobile && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 4,
            cursor: 'col-resize',
            bgcolor: isDragging ? 'primary.main' : 'transparent',
            transition: 'background-color 0.15s',
            zIndex: 1,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.4),
            },
          }}
        />
      )}
    </Drawer>
  );
}
