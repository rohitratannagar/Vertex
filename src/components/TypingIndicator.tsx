import { Box, Avatar, keyframes } from '@mui/material';
import { SmartToy as BotIcon } from '@mui/icons-material';

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
`;

export default function TypingIndicator() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        maxWidth: 800,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        py: 1.5,
        alignItems: 'flex-start',
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          mt: 0.5,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontSize: 16,
        }}
      >
        <BotIcon fontSize="small" />
      </Avatar>

      <Box
        sx={{
          display: 'flex',
          gap: 0.6,
          alignItems: 'center',
          bgcolor: 'action.hover',
          borderRadius: '18px 18px 18px 4px',
          px: 2,
          py: 1.5,
          mt: 2.5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
              opacity: 0.5,
              animation: `${bounce} 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
