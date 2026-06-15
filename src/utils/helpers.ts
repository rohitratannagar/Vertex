export function generateId(): string {
  return crypto.randomUUID();
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

const BOT_RESPONSES = [
  "That's a great question! Let me think about that for a moment. Based on my analysis, I'd suggest considering multiple approaches to solve this problem effectively.",
  "I understand what you're looking for. Here's what I can tell you — the solution involves a few key steps that we can work through together.",
  "Interesting! I've processed your request and here are my thoughts. Let me break this down into manageable pieces for you.",
  "Thanks for sharing that. I've analyzed the information and have some insights that might be helpful for your situation.",
  "Great point! Let me elaborate on that. There are several factors to consider, and I want to make sure we cover all the important aspects.",
];

export function getRandomResponse(): string {
  return BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
}
