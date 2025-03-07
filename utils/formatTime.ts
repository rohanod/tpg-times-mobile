import { useSettings } from '../hooks/useSettings';

export const formatTime = (timestamp: string) => {
  const { timeFormat } = useSettings();
  
  if (timeFormat === 'minutes') {
    const departureTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((departureTime - now) / 60000);
    return diffMinutes > 0 ? `${diffMinutes} min` : 'Departing';
  }

  // 24-hour time format
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};