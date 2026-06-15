import { Box, Typography, Grid, Paper, alpha, useTheme } from '@mui/material';
import {
  Code as CodeIcon,
  AutoAwesome as AutoAwesomeIcon,
  EditNote as EditNoteIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  Create as CreateIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { useChatContext } from '../context/ChatContext';
import { useConfig } from '../context/ConfigContext';

const ICON_MAP: Record<string, SvgIconComponent> = {
  Code: CodeIcon,
  AutoAwesome: AutoAwesomeIcon,
  EditNote: EditNoteIcon,
  School: SchoolIcon,
  Lightbulb: LightbulbIcon,
  Psychology: PsychologyIcon,
  Create: CreateIcon,
  Build: BuildIcon,
};

export default function WelcomeScreen() {
  const theme = useTheme();
  const { sendMessage } = useChatContext();
  const config = useConfig();

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        pb: 8,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 800,
          color: '#fff',
          mb: 3,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
        }}
      >
        {config.appName.charAt(0).toUpperCase()}
      </Box>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Welcome to {config.appName}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 5, maxWidth: 480 }}
      >
        {config.tagline}
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: 600 }}>
        {config.suggestions.map((s) => {
          const Icon = ICON_MAP[s.icon] || CodeIcon;
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={s.title}>
              <Paper
                elevation={0}
                onClick={() => sendMessage(s.prompt)}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Icon />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {s.title}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1.5, display: 'block', textAlign: 'left' }}
                >
                  {s.prompt}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
