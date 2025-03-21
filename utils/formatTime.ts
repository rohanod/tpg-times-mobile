// Utility function for formatting time
import { TIME_CONFIG } from '../config';

export const formatTime = (timestamp: string, timeFormat: 'minutes' | 'time') => {
  if (timeFormat === 'minutes') {
    const departureTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffMinutes = Math.max(0, Math.floor((departureTime - now) / 60000));
    return diffMinutes;
  }

  // 24-hour time format
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};