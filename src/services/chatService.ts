export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const MAX_CLIENT_MESSAGE_LENGTH = 600;

export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<string> {
  const trimmed = message.trim().slice(0, MAX_CLIENT_MESSAGE_LENGTH);
  if (!trimmed) {
    throw new Error('Please enter a message.');
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: trimmed,
      history: history.slice(-12),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Could not get a response right now.');
  }

  const data = await response.json();
  return data.reply;
}
